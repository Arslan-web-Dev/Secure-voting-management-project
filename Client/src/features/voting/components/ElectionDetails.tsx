import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2, CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';

export default function ElectionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [election, setElection] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [secretId, setSecretId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [secretIdInput, setSecretIdInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  const fetchDetails = async () => {
    try {
      const [electionRes, candidatesRes] = await Promise.all([
        supabase.from('elections').select('*').eq('id', id).single(),
        supabase.from('candidates').select('*').eq('election_id', id)
      ]);

      if (electionRes.error) throw electionRes.error;
      setElection(electionRes.data);
      setCandidates(candidatesRes.data || []);

      if (user) {
        const { data: regData } = await supabase
          .from('voter_registrations')
          .select('*')
          .eq('election_id', id)
          .eq('voter_id', user.id)
          .single();
          
        if (regData) {
          setIsRegistered(true);
          // Check if they've already used their secret ID
          const { data: secretData } = await supabase
            .from('secret_voter_ids')
            .select('is_used, secret_code')
            .eq('election_id', id)
            .eq('voter_id', user.id)
            .single();
            
          if (secretData) {
            setSecretId(secretData.secret_code);
            if (secretData.is_used) {
              setHasVoted(true);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) return;
    setIsRegistering(true);
    setError(null);

    try {
      // Step 1: Check if election is locked/closed (Simplified for frontend, real check is DB trigger)
      const now = new Date();
      const deadline = new Date(election.registration_deadline);
      
      if (now > deadline) {
        throw new Error("Registration deadline has passed.");
      }

      // Check current registration count
      const { count } = await supabase
        .from('voter_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('election_id', id);

      if (count !== null && count >= election.max_voters) {
        throw new Error("Maximum voter capacity reached. Poll is locked.");
      }

      // Step 2: Register Voter (Database trigger will generate the secret_voter_ids record automatically)
      const { error: regError } = await supabase
        .from('voter_registrations')
        .insert([{ election_id: id, voter_id: user.id }]);

      if (regError) {
        if (regError.code === '23505') throw new Error("You are already registered.");
        throw regError;
      }

      // Step 3: Fetch the generated Secret ID
      const { data: secretData, error: secretError } = await supabase
        .from('secret_voter_ids')
        .select('secret_code')
        .eq('election_id', id)
        .eq('voter_id', user.id)
        .single();

      if (secretError) {
        console.error("Failed to retrieve generated secret ID:", secretError);
        throw new Error("Registration succeeded, but failed to retrieve your Secret ID. Please refresh the page.");
      } else if (secretData) {
        setSecretId(secretData.secret_code);
      }
      
      setIsRegistered(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate || !secretIdInput.trim()) {
      setError("Please select a candidate and enter your Secret ID.");
      return;
    }
    
    setIsVoting(true);
    setError(null);
    
    try {
      // Call the secure Postgres function we created in the schema
      const { data, error: voteError } = await supabase.rpc('cast_vote', {
        p_election_id: id,
        p_candidate_id: selectedCandidate,
        p_secret_code: secretIdInput
      });

      if (voteError) throw voteError;

      setVoteSuccess(true);
      setHasVoted(true);
    } catch (err: any) {
      setError(err.message || "Failed to cast vote. Invalid Secret ID or already voted.");
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;
  if (!election) return <div className="p-8 text-center text-red-500">Election not found</div>;

  const isRegistrationOpen = new Date() < new Date(election.registration_deadline);
  const isElectionActive = election.status === 'active';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
        <div className="p-6 sm:p-10 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide mb-4
                ${election.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {election.status}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{election.title}</h1>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-3xl">{election.description}</p>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <Clock className="mr-2 h-5 w-5 text-slate-400" />
              <span>Registration Closes: <strong className="text-slate-900 dark:text-white">{new Date(election.registration_deadline).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
              <Users className="mr-2 h-5 w-5 text-slate-400" />
              <span>Max Capacity: <strong className="text-slate-900 dark:text-white">{election.max_voters} Voters</strong></span>
            </div>
          </div>
        </div>

        {/* Registration Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-10">
          {!user ? (
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-400 mb-4">You must be logged in to participate.</p>
              <Link to="/auth/login" className="inline-flex justify-center rounded-md border border-transparent bg-primary py-2 px-6 text-sm font-medium text-white hover:bg-primary/90">
                Log In to Register
              </Link>
            </div>
          ) : isRegistered ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-green-800 dark:text-green-300 font-medium">You are registered for this election.</span>
              </div>
              {secretId && (
                <div className="bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 p-4 rounded-md shadow-sm w-full max-w-md text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Your Secret Voter ID (Save this!)</p>
                  <p className="font-mono text-2xl font-bold tracking-wider text-slate-900 dark:text-white select-all">{secretId}</p>
                </div>
              )}
            </div>
          ) : !isRegistrationOpen ? (
            <div className="flex items-center justify-center p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
              <span className="text-yellow-800 dark:text-yellow-300 font-medium">Registration is closed for this poll.</span>
            </div>
          ) : (
            <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Join Election</h3>
              
              {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
              
              <div className="flex items-start mb-6">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-slate-700 dark:text-slate-300">
                    I want to participate
                  </label>
                  <p className="text-slate-500 dark:text-slate-400">By checking this, you agree to the terms of anonymity and verify your eligibility.</p>
                </div>
              </div>
              
              <button
                onClick={handleRegister}
                disabled={!termsAccepted || isRegistering}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isRegistering ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register Now'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Voting Section (Only if registered and election is active) */}
      {isRegistered && isElectionActive && !hasVoted && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-10 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Cast Your Vote</h2>
          
          {error && <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">{error}</div>}
          {voteSuccess && <div className="mb-6 text-sm text-green-700 bg-green-50 p-4 rounded-md border border-green-200 font-medium">Vote cast successfully! Your vote is anonymous and secure.</div>}

          {!voteSuccess && (
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {candidates.map(candidate => (
                  <div 
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${selectedCandidate === candidate.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{candidate.name}</h3>
                      {selectedCandidate === candidate.id && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                    <p className="text-xs text-primary font-medium">{candidate.designation}</p>
                  </div>
                ))}
              </div>

              <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Enter Secret Voter ID</label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">You received this unique code when you registered. It looks like POLL-2026-XXXX.</p>
                <input
                  type="text"
                  placeholder="POLL-YYYY-XXXX"
                  value={secretIdInput}
                  onChange={(e) => setSecretIdInput(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary dark:bg-slate-800 dark:border-slate-600 dark:text-white mb-4"
                />
                
                <button
                  onClick={handleVote}
                  disabled={isVoting || !selectedCandidate || !secretIdInput}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {isVoting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm & Cast Anonymous Vote'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasVoted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 text-center mb-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">You have already voted!</h2>
          <p className="text-green-600 dark:text-green-400">Thank you for participating in this election.</p>
          <div className="mt-6">
            <Link to="/voter/polls" className="text-primary hover:underline font-medium">Return to Dashboard</Link>
          </div>
        </div>
      )}

      {/* Candidates Preview */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Candidates Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {candidates.length === 0 ? (
            <p className="text-slate-500 col-span-full">No candidates announced yet.</p>
          ) : (
            candidates.map(candidate => (
              <div key={candidate.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{candidate.name}</h3>
                <p className="text-sm font-medium text-primary mb-3">{candidate.designation}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">{candidate.manifesto}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
