import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="grow">{children}</main>
            <Footer />
        </div>
    );
}
