/**
 * Marketing Personalizer Service
 * Uses Pinecone vector database and OpenAI embeddings for customer recommendations
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import prisma from '@/lib/db';

export class MarketingPersonalizer {
    private pinecone: Pinecone;
    private openai: OpenAI;
    private indexName: string;

    constructor() {
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY!,
        });
        this.indexName = process.env.PINECONE_INDEX_NAME || 'customer-preferences';
    }

    /**
     * Get personalized menu recommendations for a customer
     */
    async getPersonalizedRecommendations(customerId: string): Promise<any[]> {
        const index = this.pinecone.Index(this.indexName);

        // 1. Generate customer embedding based on history and preferences
        const customerEmbedding = await this.getCustomerEmbedding(customerId);

        // 2. Query index for similar menu items
        const results = await index.query({
            vector: customerEmbedding,
            topK: 10,
            includeMetadata: true,
            filter: { isAvailable: { $eq: true } }
        });

        return results.matches.map(match => ({
            menuItemId: match.id,
            score: match.score,
            metadata: match.metadata,
            reason: this.generateReason(match.metadata as any)
        }));
    }

    /**
     * Sync customer profile to vector database
     */
    async syncCustomerVector(customerId: string): Promise<void> {
        const embedding = await this.getCustomerEmbedding(customerId);
        const index = this.pinecone.Index(this.indexName);

        await index.upsert([{
            id: `customer:${customerId}`,
            values: embedding,
            metadata: { type: 'customer', customerId }
        }]);
    }

    private async getCustomerEmbedding(customerId: string): Promise<number[]> {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                orders: {
                    include: { items: { include: { menuItem: true } } },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!customer) throw new Error('Customer not found');

        // Create a comprehensive text description of the customer
        const orderHistory = customer.orders.flatMap(o => o.items.map(i => i.menuItem.name)).join(', ');
        const descriptors = [
            customer.preferences ? `Preferences: ${customer.preferences}` : '',
            customer.tags ? `Tags: ${customer.tags}` : '',
            orderHistory ? `Recent orders: ${orderHistory}` : '',
            customer.segment ? `Segment: ${customer.segment}` : ''
        ].filter(Boolean).join('. ');

        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: descriptors || 'New customer with no history yet'
        });

        return response.data[0].embedding;
    }

    private generateReason(metadata: any): string {
        if (metadata?.category) {
            return `Based on your love for ${metadata.category}`;
        }
        return 'Recommended for you';
    }
}

export const marketingPersonalizer = new MarketingPersonalizer();
