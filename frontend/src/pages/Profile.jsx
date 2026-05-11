import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Please log in to view your profile.</p>
        <button onClick={() => navigate('/login')} className="text-brand-brown font-bold underline">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header/Banner */}
        <div className="h-32 bg-brand-green relative">
          <div className="absolute -bottom-12 left-10 h-24 w-24 bg-brand-brown rounded-2xl border-4 border-white flex items-center justify-center text-brand-cream text-3xl font-black shadow-lg">
            {user.username[0].toUpperCase()}
          </div>
        </div>

        <div className="pt-16 pb-10 px-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-gray-900">{user.username}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <button 
              onClick={logout}
              className="bg-red-50 text-red-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>

          <hr className="my-8 border-gray-100" />

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Status</label>
              <p className="text-lg font-medium text-brand-green">Active Member</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Saved Addresses</label>
              <p className="text-lg font-medium text-gray-800">You haven't saved any addresses yet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}