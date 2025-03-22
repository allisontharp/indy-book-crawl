'use client';
import Header from "@/components/Header";



export default function AboutPage() {
    return (
        <main>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-white">About</h1>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 text-white">Indy Indie Book Crawl</h2>
                        <p className="text-white">
                            <b>Indy Indie Book Crawl</b> is a four day event across to support local, independent, and community bookstores across the greater Indianapolis area.
                            <br />
                            <br />
                            Learn more <a href="https://docs.google.com/forms/d/e/1FAIpQLSeWk0ACYmHZtwPMDcq1A6rZbfak4qq4LjMPz1MgcJiXIiK3Kg/viewform" className="text-blue-500" target="_blank" rel="noopener noreferrer">here</a>.
                        </p>
                    </section>
                    <section className="text-sm">
                        <p className="text-white">
                            <i>This website was written by a software engineer who should have spent their time reading. </i>
                            <i><b>It is not affiliated with Indy Indie Book Crawl in any way, I'm just a fan.</b></i>
                        </p>
                    </section>
                </div>
            </div>
        </main >
    );
}