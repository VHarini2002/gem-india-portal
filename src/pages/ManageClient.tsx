import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AppLayout from '@/components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Link2, Unlink, PackagePlus, Trash2, Upload } from 'lucide-react';

type ActionType =
  | 'create'
  | 'assign'
  | 'remove'
  | 'parts'
  | 'delete'
  | null;

const ManageClient = () => {
  const { user, isAuthenticated } = useAuth();
  const { isDarkTheme } = useTheme();
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState<ActionType>(null);

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== 'kam') return <Navigate to="/dashboard" replace />;

  const cardBase =
    'flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition-all';

  const cardTheme = isDarkTheme
    ? 'border-white/10 bg-white/5 hover:bg-white/10'
    : 'border-gray-200 bg-white hover:bg-gray-50';

  const labelTheme = isDarkTheme ? 'text-white' : 'text-gray-900';
  const subTheme = isDarkTheme ? 'text-gray-400' : 'text-gray-600';

  const handleBack = () => navigate('/dashboard');

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut', staggerChildren: 0.06 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: 'easeOut' } },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.18, ease: 'easeIn' } },
  };

  return (
    <AppLayout>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${labelTheme}`}>
              Client Management
            </h1>
            <p className={`mt-2 max-w-xl text-sm ${subTheme}`}>
              Manage clients, assign engines, and maintain the parts catalog associated with each client.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={handleBack}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-2xl text-sm font-medium border border-indigo-500 text-indigo-500 hover:bg-indigo-50"
          >
            Back to KAM Dashboard
          </motion.button>
        </motion.div>

        {/* Action list */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <motion.button
            type="button"
            onClick={() => setActiveAction('create')}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${cardBase} ${cardTheme} ${activeAction === 'create' ? 'ring-2 ring-indigo-500/60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <UserPlus className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${labelTheme}`}>
                  Create Client
                </p>
                <p className={`text-xs ${subTheme}`}>
                  Register a new leasing company or operator.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveAction('assign')}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${cardBase} ${cardTheme} ${activeAction === 'assign' ? 'ring-2 ring-indigo-500/60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                <Link2 className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${labelTheme}`}>
                  Assign Engine to Client
                </p>
                <p className={`text-xs ${subTheme}`}>
                  Link an engine ESN to a client contract.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveAction('remove')}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${cardBase} ${cardTheme} ${activeAction === 'remove' ? 'ring-2 ring-indigo-500/60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Unlink className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${labelTheme}`}>
                  Remove Assigned Engine
                </p>
                <p className={`text-xs ${subTheme}`}>
                  De-link an engine from a client when a contract ends.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveAction('parts')}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${cardBase} ${cardTheme} ${activeAction === 'parts' ? 'ring-2 ring-indigo-500/60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <PackagePlus className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${labelTheme}`}>
                  Enter Parts Catalog
                </p>
                <p className={`text-xs ${subTheme}`}>
                  Upload part images and maintain important part details.
                </p>
              </div>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => setActiveAction('delete')}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`${cardBase} ${cardTheme} ${activeAction === 'delete' ? 'ring-2 ring-indigo-500/60' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-red-500/10 text-red-500">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className={`text-sm font-semibold ${labelTheme}`}>
                  Delete Client
                </p>
                <p className={`text-xs ${subTheme}`}>
                  Deactivate or remove a client from the portal.
                </p>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {activeAction && (
            <motion.div
              key={activeAction}
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
              className={`rounded-3xl border p-6 mt-2 ${
                isDarkTheme
                  ? 'border-white/10 bg-slate-900/80'
                  : 'border-gray-200 bg-white'
              }`}
            >
            {activeAction === 'create' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${labelTheme}`}>
                  Create Client
                </h2>
                <p className={`text-xs ${subTheme}`}>
                  Capture key client information. This is a front-end only form right now – wire it to your API when ready.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Client Name</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Global Lessors Inc"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Client Code</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="GLI-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Primary Contact</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="contact@client.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Country</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="India"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Status</label>
                    <select className="w-full rounded-xl border px-3 py-2 text-sm">
                      <option>Active</option>
                      <option>Onboarding</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-2xl text-xs border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save Client
                  </button>
                </div>
              </div>
            )}

            {activeAction === 'assign' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${labelTheme}`}>
                  Assign Engine to Client
                </h2>
                <p className={`text-xs ${subTheme}`}>
                  Select a client and map engine ESNs to the contract. Hook this to your engines API later.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Client</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Search or select client"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Contract ID</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="CON-2026-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Engine ESN</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="ESN-12345"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Lease Start</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Lease End</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-2xl text-xs border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Assign Engine
                  </button>
                </div>
              </div>
            )}

            {activeAction === 'remove' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${labelTheme}`}>
                  Remove Assigned Engine
                </h2>
                <p className={`text-xs ${subTheme}`}>
                  Mark an engine as returned or de-linked from a specific client.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Client</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Select client"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Engine ESN</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="ESN-12345"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Return Date</label>
                    <input
                      type="date"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium">
                      Notes / Reason
                    </label>
                    <textarea
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      rows={3}
                      placeholder="e.g. Lease end, engine swapped, repossession, etc."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-2xl text-xs border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                  >
                    Remove Engine
                  </button>
                </div>
              </div>
            )}

            {activeAction === 'parts' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${labelTheme}`}>
                  Enter Parts Catalog
                </h2>
                <p className={`text-xs ${subTheme}`}>
                  Maintain a structured catalog of parts for each engine and client. You can upload the part image and key technical/commercial data.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Client</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Select client"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Engine ESN</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="ESN-12345"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Part Number</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="PN-XXXX"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Serial Number</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="SN-XXXXX"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Condition</label>
                    <select className="w-full rounded-xl border px-3 py-2 text-sm">
                      <option>Serviceable</option>
                      <option>Overhauled</option>
                      <option>As Removed</option>
                      <option>New</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium">
                      Part Description
                    </label>
                    <textarea
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Short technical description of the part, module, and life limits."
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Certification</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="e.g. EASA Form 1, FAA 8130-3, ARC date, etc."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">List Price (USD)</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium">Upload Part Image</label>
                    <motion.div
                      whileHover={{ scale: 1.005 }}
                      className="flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3"
                    >
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${labelTheme}`}>
                          Drag & drop or click to upload
                        </p>
                        <p className={`text-[11px] ${subTheme}`}>
                          JPEG / PNG up to 5MB.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="w-32 text-[11px]"
                      />
                    </motion.div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-2xl text-xs border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Save Part to Catalog
                  </button>
                </div>
              </div>
            )}

            {activeAction === 'delete' && (
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${labelTheme}`}>
                  Delete Client
                </h2>
                <p className={`text-xs ${subTheme}`}>
                  Deactivate or permanently delete a client. In production you
                  may want to soft-delete (archive) instead of hard delete.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Client</label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Select client"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">
                      Confirmation Text
                    </label>
                    <input
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      placeholder="Type DELETE to confirm"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-3">
                    <label className="text-xs font-medium">
                      Reason / Internal Notes
                    </label>
                    <textarea
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Why is this client being removed?"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveAction(null)}
                    className="px-4 py-2 rounded-2xl text-xs border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-2xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete Client
                  </button>
                </div>
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
};

export default ManageClient;

