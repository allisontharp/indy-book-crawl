import { Bookstore } from '@/types';

interface BookstoreProps {
    bookstore: Bookstore;
}

const BookstoreCard = ({ bookstore }: BookstoreProps) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">{bookstore.name}</h3>
                <p className="mt-1 text-gray-600">
                    {bookstore.address.street}<br />
                    {bookstore.address.city}, {bookstore.address.state} {bookstore.address.zip}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {bookstore.categories.map((category) => (
                        <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                            {category}
                        </span>
                    ))}
                </div>
                {bookstore.website && (
                    <a
                        href={bookstore.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
                    >
                        Visit Website
                    </a>
                )}
            </div>
        </div>
    )
}

export default BookstoreCard 