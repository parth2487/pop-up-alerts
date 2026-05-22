import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axios'; // <-- PASTIKAN INI DIIMPOR DENGAN BENAR

// Definisikan tipe data untuk sebuah ulasan
interface Review {
  id: string;
  rating: number;
  text: string;
  author: string;
}

// Komponen kecil untuk menampilkan bintang
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewManagementPage() {
  const { widgetId } = useParams<{ widgetId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [widgetDetails, setWidgetDetails] = useState<{name: string, workspaceId: string} | null>(null);

  // State untuk form penambahan ulasan baru
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');

  // Fungsi untuk mengambil data ulasan
  const fetchReviews = useCallback(async () => {
    if (!widgetId) return;
    try {
      // Menggunakan apiClient yang benar
      const reviewsResponse = await apiClient.get(`/reviews/widget/${widgetId}`);
      setReviews(reviewsResponse.data);
    } catch (err) {
      setError('Failed to fetch reviews.');
    }
  }, [widgetId]);

  // Ambil data saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
        if (!widgetId) return;
        try {
            setLoading(true);
            const detailsResponse = await apiClient.get(`/widgets/${widgetId}/details`);
            setWidgetDetails(detailsResponse.data);
            await fetchReviews();
        } catch (err) {
            setError('Failed to fetch initial data for this widget.');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [widgetId, fetchReviews]);

  // Fungsi untuk menangani submit ulasan baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Menggunakan apiClient yang benar
      await apiClient.post(`/reviews/widget/${widgetId}`, {
        rating,
        text,
        author,
      });
      setRating(5);
      setText('');
      setAuthor('');
      await fetchReviews();
    } catch (err) {
      setError('Failed to add review. Please check your input.');
    }
  };

  if (loading) return <div className="p-8">Loading reviews...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {widgetDetails && (
         <Link to={`/app/workspace/${widgetDetails.workspaceId}`} className="text-brand-primary mb-4 inline-block hover:underline">&larr; Back to Widgets</Link>
      )}
      <h1 className="text-3xl font-bold mb-6">Manage Reviews for "{widgetDetails?.name}"</h1>

      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add a New Review</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none">
                  <svg className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700">Review Text</label>
            <textarea id="text" value={text} onChange={e => setText(e.target.value)} required rows={3} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author Name</label>
            <input id="author" type="text" value={author} onChange={e => setAuthor(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90">Add Review</button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-4">Existing Reviews</h2>
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map(review => (
            <div key={review.id} className="p-4 bg-white rounded-lg shadow">
              <StarRating rating={review.rating} />
              <p className="text-gray-700 my-2">"{review.text}"</p>
              <p className="text-gray-500 text-sm text-right font-semibold">- {review.author}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No reviews added yet. Add one using the form above!</p>
        )}
      </div>
    </div>
  );
}

