import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    Indy Book Crawl
                                </Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link
                                    href="/"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/"
                                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Bookstores
                                </Link>
                                <Link
                                    href="/map"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/map"
                                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Map
                                </Link>
                                {/* <Link
                                    href="/events"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/events"
                                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Events
                                </Link> */}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        © {new Date().getFullYear()} Indy Book Crawl. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
} 