'use client';

import { useState, useEffect, ReactElement, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  sku?: string;
  quantity: number;
  committedQuantity: number;
  available: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  locationName: string;
  lastCountedAt?: string;
}

interface PaginationMeta {
  count: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface InventoryNote {
  id: string;
  content: string;
  status: string;
  parsedResult: ParsedAdjustment[] | null;
  createdAt: string;
}

interface ParsedAdjustment {
  productName: string;
  productId: string | null;
  variantId: string | null;
  quantity: number;
  action: 'add' | 'remove' | 'set';
  confidence: number;
}

// Stats card component for consistent styling
function StatCard({
  title,
  value,
  color = 'blue',
  icon
}: {
  title: string;
  value: string | number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  icon?: ReactElement;
}): ReactElement {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Filter button component
function FilterButton({
  children,
  active,
  onClick,
  count
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count?: number;
}): ReactElement {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          active ? 'bg-white/20' : 'bg-gray-200'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StockStatus({ available, threshold }: { available: number; threshold: number }): ReactElement {
  if (available <= 0) {
    return (
      <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
        Out of Stock
      </span>
    );
  }
  if (available <= threshold) {
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
        Low Stock
      </span>
    );
  }
  return (
    <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
      In Stock
    </span>
  );
}

// Pending Notes Panel component
function NotesPanel({
  notes,
  onProcess,
  onApply,
  onDismiss,
  onClose,
  processingId,
  applyingId,
}: {
  notes: InventoryNote[];
  onProcess: (id: string) => void;
  onApply: (id: string, adjustments: ParsedAdjustment[]) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
  processingId: string | null;
  applyingId: string | null;
}): ReactElement {
  // Track editable adjustments per note
  const [editableAdjustments, setEditableAdjustments] = useState<Record<string, ParsedAdjustment[]>>({});

  // When a note gets parsed results, initialize editable state
  useEffect(() => {
    const updated: Record<string, ParsedAdjustment[]> = {};
    for (const note of notes) {
      if (note.parsedResult && !editableAdjustments[note.id]) {
        updated[note.id] = [...note.parsedResult];
      }
    }
    if (Object.keys(updated).length > 0) {
      setEditableAdjustments((prev) => ({ ...prev, ...updated }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const updateAdjustment = (noteId: string, index: number, field: keyof ParsedAdjustment, value: string | number) => {
    setEditableAdjustments((prev) => {
      const list = [...(prev[noteId] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [noteId]: list };
    });
  };

  const removeAdjustment = (noteId: string, index: number) => {
    setEditableAdjustments((prev) => {
      const list = [...(prev[noteId] || [])];
      list.splice(index, 1);
      return { ...prev, [noteId]: list };
    });
  };

  const pendingNotes = notes.filter((n) => n.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Pending Notes</h2>
              <p className="text-sm text-gray-500">{pendingNotes.length} note{pendingNotes.length !== 1 ? 's' : ''} to process</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {pendingNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No pending notes to process.</p>
            </div>
          ) : (
            pendingNotes.map((note) => {
              const adjustments = editableAdjustments[note.id] || note.parsedResult;
              const hasParsed = !!note.parsedResult;
              const isProcessing = processingId === note.id;
              const isApplying = applyingId === note.id;

              return (
                <div
                  key={note.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Note content */}
                  <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium leading-relaxed">
                          &ldquo;{note.content}&rdquo;
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!hasParsed && (
                        <button
                          onClick={() => onProcess(note.id)}
                          disabled={isProcessing}
                          className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Parsing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Process with AI
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Parsed adjustments table */}
                  {hasParsed && adjustments && adjustments.length > 0 && (
                    <div className="px-5 py-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Parsed Adjustments
                      </p>
                      <div className="space-y-2">
                        {adjustments.map((adj, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              adj.productId
                                ? adj.confidence >= 0.8
                                  ? 'border-green-200 bg-green-50/50'
                                  : 'border-yellow-200 bg-yellow-50/50'
                                : 'border-red-200 bg-red-50/50'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {adj.productName}
                              </p>
                              {!adj.productId && (
                                <p className="text-xs text-red-600">No product match found</p>
                              )}
                              {adj.productId && adj.confidence < 0.8 && (
                                <p className="text-xs text-yellow-600">Low confidence match ({Math.round(adj.confidence * 100)}%)</p>
                              )}
                            </div>
                            <select
                              value={adj.action}
                              onChange={(e) => updateAdjustment(note.id, idx, 'action', e.target.value)}
                              className="text-xs font-medium px-2 py-1.5 rounded border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="add">Add</option>
                              <option value="remove">Remove</option>
                              <option value="set">Set to</option>
                            </select>
                            <input
                              type="number"
                              value={adj.quantity}
                              onChange={(e) => updateAdjustment(note.id, idx, 'quantity', parseInt(e.target.value) || 0)}
                              min={0}
                              className="w-16 text-center text-sm font-bold px-2 py-1.5 rounded border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => removeAdjustment(note.id, idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Remove row"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => onDismiss(note.id)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            const validAdj = (adjustments || []).filter((a) => a.productId);
                            if (validAdj.length > 0) onApply(note.id, validAdj);
                          }}
                          disabled={isApplying || !adjustments?.some((a) => a.productId)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isApplying ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Applying...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Apply Adjustments
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Parsed but no results */}
                  {hasParsed && (!adjustments || adjustments.length === 0) && (
                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-500 italic">AI could not extract any adjustments from this note.</p>
                      <button
                        onClick={() => onDismiss(note.id)}
                        className="mt-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage(): ReactElement {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams?.get('filter') || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Inventory notes state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);

  // Notes panel state
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [pendingNotes, setPendingNotes] = useState<InventoryNote[]>([]);
  const [processingNoteId, setProcessingNoteId] = useState<string | null>(null);
  const [applyingNoteId, setApplyingNoteId] = useState<string | null>(null);

  // Stats derived from inventory data
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('filter', filter);
      if (search) params.set('search', search);
      params.set('page', page.toString());
      params.set('limit', '50');

      const response = await fetch(`/api/v1/inventory?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInventory(data.data || []);
          setMeta(data.meta || null);

          // Calculate stats from available quantity (inStock - committed)
          const items = data.data || [];
          const lowStockCount = items.filter((i: InventoryItem) => i.available > 0 && i.available <= i.lowStockThreshold).length;
          const outOfStockCount = items.filter((i: InventoryItem) => i.available <= 0).length;
          const inStockCount = items.filter((i: InventoryItem) => i.available > i.lowStockThreshold).length;

          setStats({
            total: data.meta?.total || items.length,
            inStock: inStockCount,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const handleUpdateQuantity = async (itemId: string) => {
    try {
      const response = await fetch(`/api/v1/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: editQuantity }),
      });

      if (response.ok) {
        await fetchInventory();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Fetch pending notes
  const fetchPendingNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/inventory/notes?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPendingNotes(data.data || []);
      }
    } catch {
      // Silently fail - not critical
    }
  }, []);

  useEffect(() => {
    fetchPendingNotes();
  }, [fetchPendingNotes]);

  const handleSubmitNote = async () => {
    if (!noteContent.trim()) return;
    setNoteSaving(true);
    try {
      const res = await fetch('/api/v1/inventory/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: noteContent.trim() }),
      });
      if (res.ok) {
        setNoteContent('');
        setNoteSuccess(true);
        fetchPendingNotes();
        setTimeout(() => {
          setNoteSuccess(false);
          setShowNoteModal(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setNoteSaving(false);
    }
  };

  const handleProcessNote = async (noteId: string) => {
    setProcessingNoteId(noteId);
    try {
      const res = await fetch(`/api/v1/inventory/notes/${noteId}/process`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        // Update the note in state with parsed result
        setPendingNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? { ...n, parsedResult: data.data.adjustments }
              : n
          )
        );
      } else {
        const err = await res.json();
        alert(`Failed to process note: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to process note:', error);
      alert('Failed to process note. Check console for details.');
    } finally {
      setProcessingNoteId(null);
    }
  };

  const handleApplyNote = async (noteId: string, adjustments: ParsedAdjustment[]) => {
    setApplyingNoteId(noteId);
    try {
      const res = await fetch(`/api/v1/inventory/notes/${noteId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustments: adjustments.map((a) => ({
            productId: a.productId,
            variantId: a.variantId,
            quantity: a.quantity,
            action: a.action,
          })),
        }),
      });
      if (res.ok) {
        // Remove from pending list
        setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
        // Refresh inventory to show updated quantities
        fetchInventory();
      } else {
        const err = await res.json();
        alert(`Failed to apply adjustments: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to apply note:', error);
      alert('Failed to apply adjustments. Check console for details.');
    } finally {
      setApplyingNoteId(null);
    }
  };

  const handleDismissNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/v1/inventory/notes/${noteId}/apply`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setPendingNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to dismiss note:', error);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === 'low_stock') {
      return item.available > 0 && item.available <= item.lowStockThreshold;
    }
    if (filter === 'out_of_stock') {
      return item.available <= 0;
    }
    return true;
  });

  const pendingNotesCount = pendingNotes.length;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">
            Manage and track product stock levels
          </p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Note
          </button>
          <Link
            href="/ops/inventory/receiving/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Receive Shipment
          </Link>
          {pendingNotesCount > 0 && (
            <button
              onClick={() => setShowNotesPanel(true)}
              className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 transition-colors shadow-sm flex items-center gap-2 border border-amber-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pendingNotesCount} Pending
            </button>
          )}
          <button
            onClick={() => fetchInventory()}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            href="/ops/inventory/count"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            AI Count
          </Link>
          <Link
            href="/ops/inventory/predictions"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Predictions
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Items"
          value={stats.total.toLocaleString()}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          title="In Stock"
          value={stats.inStock.toLocaleString()}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock.toLocaleString()}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock.toLocaleString()}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              All Items
            </FilterButton>
            <FilterButton
              active={filter === 'low_stock'}
              onClick={() => setFilter('low_stock')}
              count={stats.lowStock}
            >
              Low Stock
            </FilterButton>
            <FilterButton
              active={filter === 'out_of_stock'}
              onClick={() => setFilter('out_of_stock')}
              count={stats.outOfStock}
            >
              Out of Stock
            </FilterButton>
          </div>
        </div>
        {meta && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {meta.total.toLocaleString()} item{meta.total !== 1 ? 's' : ''} total
            </span>
          </div>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded" />
                  <div className="w-24 h-6 bg-gray-200 rounded-full" />
                  <div className="w-20 h-6 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 text-lg">No inventory items found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    In Stock
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Committed
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/ops/products/${item.productId}`}
                          className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="text-sm text-gray-500">{item.variantName}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        {item.sku || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.locationName}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                          className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={0}
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {item.quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.committedQuantity > 0 ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {item.committedQuantity}
                        </span>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg font-bold ${
                        item.available <= 0 ? 'text-red-600' :
                        item.available <= item.lowStockThreshold ? 'text-yellow-600' :
                        'text-green-700'
                      }`}>
                        {item.available}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StockStatus
                        available={item.available}
                        threshold={item.lowStockThreshold}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingItem === item.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/ops/products/${item.productId}`}
                            className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => {
                              setEditingItem(item.id);
                              setEditQuantity(item.quantity);
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Edit Qty
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (meta.totalPages > 5) {
                      if (page <= 3) pageNum = i + 1;
                      else if (page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                  disabled={page === meta.totalPages}
                  className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Inventory Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Inventory Note</h2>
              <button
                onClick={() => { setShowNoteModal(false); setNoteContent(''); setNoteSuccess(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {noteSuccess ? (
                <div className="flex flex-col items-center py-8">
                  <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 font-medium">Note saved!</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-3">
                    Describe the inventory adjustment needed (e.g., &quot;add 3 bottles of Tito&apos;s&quot;, &quot;add 3 cases of Modelo&quot;).
                  </p>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Type your inventory adjustment note..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => { setShowNoteModal(false); setNoteContent(''); }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitNote}
                      disabled={!noteContent.trim() || noteSaving}
                      className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {noteSaving ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Submit Note'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Management Panel (slide-out) */}
      {showNotesPanel && (
        <NotesPanel
          notes={pendingNotes}
          onProcess={handleProcessNote}
          onApply={handleApplyNote}
          onDismiss={handleDismissNote}
          onClose={() => setShowNotesPanel(false)}
          processingId={processingNoteId}
          applyingId={applyingNoteId}
        />
      )}
    </div>
  );
}
