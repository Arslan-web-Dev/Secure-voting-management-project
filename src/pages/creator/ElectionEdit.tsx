import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Trash2, Save, Upload, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { logActivity } from '../../lib/audit';
import { getErrorMessage } from '../../lib/errors';

interface Candidate {
  id: string;
  name: string;
  designation: string;
  manifesto: string;
  photo_url?: string;
  photo_file?: File;
  isNew?: boolean;
}

const ElectionEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'General',
    startDate: '', endDate: '', deadline: '', maxVoters: 1000,
  });
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: '1', name: '', designation: '', manifesto: '' },
  ]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load existing election data
  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      const { data: election, error } = await supabase
        .from('elections')
        .select('*, candidates(*)')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single();

      if (error || !election) { setNotFound(true); setFetching(false); return; }

      const toLocal = (iso: string) => iso ? new Date(iso).toISOString().slice(0, 16) : '';

      setFormData({
        title: election.title || '',
        description: election.description || '',
        category: election.category || 'General',
        startDate: toLocal(election.start_date),
        endDate: toLocal(election.end_date),
        deadline: toLocal(election.registration_deadline),
        maxVoters: election.max_voters || 1000,
      });

      if (election.candidates?.length) {
        setCandidates(election.candidates.map((c: Candidate) => ({
          id: c.id, name: c.name, designation: c.designation || '',
          manifesto: c.manifesto || '', photo_url: c.photo_url,
        })));
      }
      setFetching(false);
    };
    load();
  }, [id, user]);

  const handlePhotoSelect = async (candidateId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, photo_url: url, photo_file: file } : c));
  };

  const handleSave = async (status: string) => {
    if (!formData.title) { toast.error('Election title is required'); return; }
    if (candidates.some(c => !c.name.trim())) { toast.error('All candidates must have a name'); return; }
    setLoading(true);

    try {
      // Update election
      const { error: electionError } = await supabase
        .from('elections')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
          end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          registration_deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          max_voters: formData.maxVoters,
          status,
        })
        .eq('id', id);

      if (electionError) throw electionError;

      // Upsert candidates
      for (const c of candidates) {
        let photoUrl = c.photo_url;
        if (c.photo_file) {
          const ext = c.photo_file.name.split('.').pop();
          const path = `candidates/${id}/${c.id}.${ext}`;
          await supabase.storage.from('election-photos').upload(path, c.photo_file, { upsert: true });
          const { data: urlData } = supabase.storage.from('election-photos').getPublicUrl(path);
          photoUrl = urlData?.publicUrl;
        }
        if (c.isNew) {
          await supabase.from('candidates').insert({
            election_id: id, name: c.name, designation: c.designation,
            manifesto: c.manifesto, photo_url: photoUrl,
          });
        } else {
          await supabase.from('candidates').update({
            name: c.name, designation: c.designation,
            manifesto: c.manifesto, photo_url: photoUrl,
          }).eq('id', c.id);
        }
      }

      await logActivity({ action: 'ELECTION_UPDATED', userId: user?.id, metadata: { election_id: id ?? null, status } });
      toast.success('Election updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update election'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="d-flex align-items-center justify-content-center py-20">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (notFound) return (
    <div className="glass-card text-center py-16">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
      <h3 className="h4 font-heading mb-2">Election Not Found</h3>
      <p className="text-muted small mb-6">This election doesn't exist or you don't have permission to edit it.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-primary px-6 py-3 rounded-xl small fw-bold">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="d-flex flex-column gap-8">
      {/* Header */}
      <div className="glass-card p-6 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="glass p-2 rounded-lg text-muted hover:text-main">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="h3 font-heading m-0">Edit Election</h1>
            <p className="text-muted small m-0">Update your election details and candidates.</p>
          </div>
        </div>
        {/* Steps */}
        <div className="d-none d-md-flex align-items-center gap-3">
          {[{ n: 1, label: 'Details' }, { n: 2, label: 'Candidates' }].map(s => (
            <div key={s.n} className="d-flex align-items-center gap-2">
              <div className={`d-flex align-items-center justify-content-center rounded-full fw-bold small`}
                style={{ width: 28, height: 28, background: step === s.n ? 'var(--primary)' : 'rgba(255,255,255,0.1)', color: step === s.n ? '#fff' : 'var(--text-muted)' }}>
                {s.n}
              </div>
              <span className={`small fw-medium ${step === s.n ? 'text-main' : 'text-muted'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="glass-card p-8">
            <h2 className="h4 font-heading mb-6">Election Details</h2>
            <div className="row g-4">
              <div className="col-12">
                <label className="text-muted small mb-2 d-block">Title *</label>
                <input type="text" className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Election title" />
              </div>
              <div className="col-12">
                <label className="text-muted small mb-2 d-block">Description</label>
                <textarea rows={3} className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main resize-none"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this election about?" />
              </div>
              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Category</label>
                <select className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main bg-deep"
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Social">Social</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Max Voters</label>
                <input type="number" className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main"
                  value={formData.maxVoters} onChange={e => setFormData({ ...formData, maxVoters: parseInt(e.target.value) })} />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">Start Date & Time</label>
                <input type="datetime-local" className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main"
                  value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">End Date & Time</label>
                <input type="datetime-local" className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main"
                  value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">Reg. Deadline</label>
                <input type="datetime-local" className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none text-main"
                  value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-6">
              <button onClick={() => setStep(2)} className="btn-primary d-flex align-items-center gap-2">
                Manage Candidates <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="d-flex flex-column gap-6">
            <div className="glass-card p-8">
              <div className="d-flex justify-content-between align-items-center mb-6">
                <h2 className="h4 font-heading m-0">Candidates</h2>
                <button onClick={() => setCandidates([...candidates, { id: Math.random().toString(), name: '', designation: '', manifesto: '', isNew: true }])}
                  className="glass py-2 px-4 rounded-lg text-primary small fw-bold d-flex align-items-center gap-2">
                  <Plus size={16} /> Add Candidate
                </button>
              </div>
              <div className="d-flex flex-column gap-5">
                {candidates.map(c => (
                  <div key={c.id} className="glass p-6 rounded-2xl position-relative">
                    {candidates.length > 1 && (
                      <button onClick={() => setCandidates(cs => cs.filter(x => x.id !== c.id))}
                        className="position-absolute top-4 end-4 text-error opacity-50 hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="row g-4">
                      <div className="col-md-2">
                        <input type="file" accept="image/*" className="d-none"
                          ref={el => { fileInputRefs.current[c.id] = el; }}
                          onChange={e => { if (e.target.files?.[0]) handlePhotoSelect(c.id, e.target.files[0]); }} />
                        <div onClick={() => fileInputRefs.current[c.id]?.click()}
                          className="rounded-xl bg-white/5 d-flex flex-column align-items-center justify-content-center text-dim gap-2 cursor-pointer overflow-hidden"
                          style={{ aspectRatio: '1', border: '1px dashed rgba(255,255,255,0.1)' }}>
                          {c.photo_url ? <img src={c.photo_url} alt={c.name} className="w-100 h-100 object-fit-cover" />
                            : <><Upload size={18} /><span style={{ fontSize: 10 }} className="fw-bold">PHOTO</span></>}
                        </div>
                      </div>
                      <div className="col-md-10">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="text-muted small mb-1 d-block">Full Name *</label>
                            <input type="text" className="glass w-full px-3 py-2 rounded-lg text-main small outline-none"
                              value={c.name} onChange={e => setCandidates(cs => cs.map(x => x.id === c.id ? { ...x, name: e.target.value } : x))} />
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-1 d-block">Designation</label>
                            <input type="text" className="glass w-full px-3 py-2 rounded-lg text-main small outline-none"
                              value={c.designation} onChange={e => setCandidates(cs => cs.map(x => x.id === c.id ? { ...x, designation: e.target.value } : x))} />
                          </div>
                          <div className="col-12">
                            <label className="text-muted small mb-1 d-block">Manifesto / Bio</label>
                            <textarea rows={2} className="glass w-full px-3 py-2 rounded-lg text-main small outline-none resize-none"
                              value={c.manifesto} onChange={e => setCandidates(cs => cs.map(x => x.id === c.id ? { ...x, manifesto: e.target.value } : x))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <button onClick={() => setStep(1)} className="glass px-6 py-3 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5">
                <ChevronLeft size={20} /> Back
              </button>
              <div className="d-flex gap-3">
                <button onClick={() => handleSave('draft')} disabled={loading}
                  className="glass px-6 py-3 rounded-xl small fw-bold text-muted hover:bg-white/5 d-flex align-items-center gap-2">
                  Save Draft
                </button>
                <button onClick={() => handleSave('published')} disabled={loading}
                  className="btn-primary px-8 py-3 d-flex align-items-center gap-2">
                  {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionEdit;
