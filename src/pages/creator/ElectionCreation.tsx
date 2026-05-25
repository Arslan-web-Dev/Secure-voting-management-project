import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Save,
  Upload,
  FileEdit
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
}

const ElectionCreation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    startDate: '',
    endDate: '',
    deadline: '',
    maxVoters: 1000,
  });
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: '1', name: '', designation: '', manifesto: '' }
  ]);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleAddCandidate = () => {
    setCandidates([...candidates, { id: Math.random().toString(), name: '', designation: '', manifesto: '' }]);
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const updateCandidate = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handlePhotoSelect = (candidateId: string, file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setCandidates(candidates.map(c => 
      c.id === candidateId ? { ...c, photo_file: file, photo_url: previewUrl } : c
    ));
  };

  const uploadCandidatePhoto = async (file: File, electionId: string, candidateIndex: number): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const filePath = `${electionId}/candidate_${candidateIndex}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('candidate-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Photo upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('candidate-photos')
      .getPublicUrl(filePath);

    return urlData?.publicUrl || null;
  };

  const handleSubmit = async (publishStatus: 'draft' | 'pending_approval' = 'pending_approval') => {
    if (!user) return;

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.deadline) {
      toast.error('Please fill in all required fields including all dates.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Election
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .insert({
          creator_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          start_date: formData.startDate,
          end_date: formData.endDate,
          registration_deadline: formData.deadline,
          max_voters: formData.maxVoters,
          status: publishStatus
        })
        .select()
        .single();

      if (electionError) throw electionError;

      // 2. Upload candidate photos & create candidate records
      const candidatesToInsert: Array<{
        election_id: string;
        name: string;
        designation: string;
        manifesto: string;
        photo_url: string | null;
      }> = [];
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        let photoUrl: string | null = null;

        if (c.photo_file) {
          photoUrl = await uploadCandidatePhoto(c.photo_file, election.id, i);
        }

        candidatesToInsert.push({
          election_id: election.id,
          name: c.name,
          designation: c.designation,
          manifesto: c.manifesto,
          photo_url: photoUrl
        });
      }

      const { error: candidateError } = await supabase
        .from('candidates')
        .insert(candidatesToInsert);

      if (candidateError) throw candidateError;

      await logActivity({
        action: `Election Created (${publishStatus})`,
        userId: user.id,
        metadata: { election_id: election.id, title: formData.title, status: publishStatus }
      });

      toast.success(publishStatus === 'draft' ? 'Election saved as draft!' : 'Election submitted for admin approval!');
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Error creating election:', error);
      toast.error(getErrorMessage(error, 'Failed to create election. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="d-flex justify-content-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10"></div>
        {[1, 2].map((s) => (
          <div key={s} className="d-flex flex-column align-items-center gap-2">
            <div className={`w-10 h-10 rounded-full d-flex align-items-center justify-content-center fw-bold transition-all ${
              step >= s ? 'bg-primary text-white' : 'bg-white/5 text-muted border border-white/5'
            }`}>
              {s}
            </div>
            <span className={`small fw-medium ${step >= s ? 'text-main' : 'text-muted'}`}>
              {s === 1 ? 'Election Details' : 'Candidates'}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-8 d-flex flex-column gap-6"
          >
            <h2 className="h3 font-heading m-0">Election Details</h2>
            
            <div className="row g-4">
              <div className="col-12">
                <label className="text-muted small mb-2 d-block">Election Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Annual Student Union Election" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="col-12">
                <label className="text-muted small mb-2 d-block">Description</label>
                <textarea 
                  rows={4}
                  placeholder="What is this election about?" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Category</label>
                <select 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main bg-deep"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="General">General</option>
                  <option value="Academic">Academic</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Social">Social</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="text-muted small mb-2 d-block">Max Voters</label>
                <input 
                  type="number" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main"
                  value={formData.maxVoters}
                  onChange={(e) => setFormData({...formData, maxVoters: parseInt(e.target.value)})}
                />
              </div>

              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>

              <div className="col-md-4">
                <label className="text-muted small mb-2 d-block">Reg. Deadline</label>
                <input 
                  type="datetime-local" 
                  className="glass w-full px-4 py-3 rounded-xl border-white/5 outline-none focus:border-primary/50 text-main"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button 
                onClick={() => setStep(2)}
                className="btn-primary"
              >
                Continue to Candidates <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="d-flex flex-column gap-6"
          >
            <div className="glass-card p-8">
              <div className="d-flex justify-content-between align-items-center mb-8">
                <h2 className="h3 font-heading m-0">Candidate Management</h2>
                <button 
                  onClick={handleAddCandidate}
                  className="glass py-2 px-4 rounded-lg text-primary hover:bg-primary/5 small fw-bold"
                >
                  <Plus size={18} /> Add Candidate
                </button>
              </div>

              <div className="d-flex flex-column gap-6">
                {candidates.map((c) => (
                  <div key={c.id} className="glass p-6 rounded-2xl border-white/5 relative">
                    <div className="absolute top-4 right-4">
                      {candidates.length > 1 && (
                        <button 
                          onClick={() => handleRemoveCandidate(c.id)}
                          className="text-error opacity-50 hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    <div className="row g-4">
                      <div className="col-md-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          ref={(el) => { fileInputRefs.current[c.id] = el; }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handlePhotoSelect(c.id, e.target.files[0]);
                          }}
                        />
                        <div 
                          onClick={() => fileInputRefs.current[c.id]?.click()}
                          className="w-full aspect-square rounded-xl bg-white/5 d-flex flex-column align-items-center justify-content-center text-dim gap-2 border border-dashed border-white/10 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                        >
                          {c.photo_url ? (
                            <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Upload size={20} />
                              <span className="text-[10px] fw-bold">PHOTO</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="col-md-10">
                        <div className="row g-4">
                          <div className="col-md-6">
                            <label className="text-muted small mb-2 d-block">Full Name</label>
                            <input 
                              type="text" 
                              className="glass w-full px-4 py-2 rounded-lg border-white/5 outline-none focus:border-primary/50 text-main small"
                              value={c.name}
                              onChange={(e) => updateCandidate(c.id, 'name', e.target.value)}
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="text-muted small mb-2 d-block">Designation</label>
                            <input 
                              type="text" 
                              className="glass w-full px-4 py-2 rounded-lg border-white/5 outline-none focus:border-primary/50 text-main small"
                              value={c.designation}
                              onChange={(e) => updateCandidate(c.id, 'designation', e.target.value)}
                            />
                          </div>
                          <div className="col-12">
                            <label className="text-muted small mb-2 d-block">Manifesto / Bio</label>
                            <textarea 
                              rows={2}
                              className="glass w-full px-4 py-2 rounded-lg border-white/5 outline-none focus:border-primary/50 text-main small resize-none"
                              value={c.manifesto}
                              onChange={(e) => updateCandidate(c.id, 'manifesto', e.target.value)}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button 
                onClick={() => setStep(1)}
                className="glass px-6 py-3 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5"
              >
                <ChevronLeft size={20} /> Back
              </button>
              <button 
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="glass px-6 py-3 rounded-xl d-flex align-items-center gap-2 hover:bg-white/5 small fw-bold text-muted"
              >
                <FileEdit size={18} /> Save as Draft
              </button>
              <button 
                onClick={() => handleSubmit('pending_approval')}
                disabled={loading}
                className="btn-primary px-8 py-3 h5"
              >
                {loading ? <div className="spinner" style={{width: 20, height: 20, borderWidth: 2}}></div> : (
                  <>Submit for Approval <Save size={20} /></>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ElectionCreation;
