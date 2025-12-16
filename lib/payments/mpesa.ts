
export class MpesaService {
    private consumerKey = process.env.MPESA_CONSUMER_KEY!;
    private consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    private passkey = process.env.MPESA_PASSKEY!;
    private shortcode = process.env.MPESA_SHORTCODE!;
    private baseUrl = "https://sandbox.safaricom.co.ke";

    private async getAccessToken() {
        const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64");
        const res = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: { Authorization: `Basic ${auth}` },
        });
        const data = await res.json();
        return data.access_token;
    }

    async initiateSTKPush(phoneNumber: string, amount: number, orderId: string, accountRef: string) {
        if (!this.consumerKey) {
            console.warn("M-Pesa Keys missing. simulating success.");
            return { ResponseCode: "0", CustomerMessage: "Success (Simulated)" };
        }

        const token = await this.getAccessToken();
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
        const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString("base64");

        const res = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phoneNumber,
                PartyB: this.shortcode,
                PhoneNumber: phoneNumber,
                CallBackURL: `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`,
                AccountReference: accountRef,
                TransactionDesc: `Order ${orderId}`,
            }),
        });

        return res.json();
    }
}

export const mpesa = new MpesaService();
