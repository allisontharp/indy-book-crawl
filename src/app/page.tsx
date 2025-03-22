import BookshopsList from '@/components/BookshopList';
import Header from '../components/Header';

export default function Home() {
  return (
    <main>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-100 sm:text-5xl sm:tracking-tight">
            Indiana Book Crawl
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-400 sm:mt-4">
            Find your next favorite bookshop.
          </p>
        </div>

        <div className="my-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Bookshops</h2>
          <BookshopsList />
        </div>
      </div>
    </main>
  );
}