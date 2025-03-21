import Link from 'next/link'

const Header = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-500">
                            Indy Book Crawl
                        </Link>
                    </div>
                    <nav className="flex space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-indigo-600">
                            Bookstores
                        </Link>
                        <Link href="/map" className="text-gray-700 hover:text-indigo-600">
                            Map
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header 