import BookstoreCard from './BookstoreCard'
import { Bookstore } from '@/types'

interface BookstoreListProps {
    bookstores: Bookstore[]
}

const BookstoreList = ({ bookstores }: BookstoreListProps) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookstores.map((bookstore) => (
                    <BookstoreCard
                        key={bookstore.id}
                        bookstore={bookstore}
                    />
                ))}
            </div>
        </div>
    )
}

export default BookstoreList 