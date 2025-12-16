import prisma from '@/lib/db';

export async function getOptimizedMenuSuggestions(restaurantId: string) {
  // 1. Fetch Inventory & Sales Data
  const inventory = await prisma.inventoryItem.findMany({
    where: { restaurantId },
    include: { batches: true },
  });

  // 2. Mock AI Logic (Placeholder)
  // In a real app, we would feed this data + weather/time to an LLM.
  
  const suggestions = inventory
    .filter(item => {
      const totalStock = item.batches.reduce((sum, b) => sum + b.quantityRemaining.toNumber(), 0);
      return totalStock > 50; // Suggest items with high stock
    })
    .map(item => ({
      type: 'SURPLUS_STOCK',
      message: `Promote dishes with ${item.name} to reduce surplus inventory.`,
      confidence: 0.85,
    }));

  return suggestions;
}
