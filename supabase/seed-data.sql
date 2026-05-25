-- ============================================================
-- SecureVote — Complete Seed Data
-- 10 Election Creators + 50 Voters + Elections + Candidates + Votes
-- 
-- HOW TO USE:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Paste this entire file and click Run
-- NOTE: This creates profiles directly (bypasses auth.users).
--       For real login, create users in Supabase Auth first,
--       then their profile auto-creates via trigger.
-- ============================================================

-- ============================================================
-- STEP 1: Insert Super Admin profile (update ID to match your auth user)
-- ============================================================
INSERT INTO profiles (id, full_name, email, role, is_approved, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'admin@securevote.com', 'super_admin', true, NOW() - INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 2: Election Creators (10 creators)
-- ============================================================
INSERT INTO profiles (id, full_name, email, phone, role, organization, election_purpose, is_approved, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Ahmed Raza',       'ahmed.raza@nust.edu.pk',      '+92-300-1111001', 'election_creator', 'NUST University',          'Student Council Elections 2025',             true, NOW() - INTERVAL '80 days'),
  ('10000000-0000-0000-0000-000000000002', 'Fatima Khan',      'fatima.khan@punjabuni.edu.pk', '+92-301-1111002', 'election_creator', 'Punjab University',        'Faculty Senate Annual Elections',            true, NOW() - INTERVAL '75 days'),
  ('10000000-0000-0000-0000-000000000003', 'Bilal Hussain',    'bilal@techcorp.pk',            '+92-302-1111003', 'election_creator', 'TechCorp Pakistan',        'Board of Directors Election',                true, NOW() - INTERVAL '70 days'),
  ('10000000-0000-0000-0000-000000000004', 'Sana Malik',       'sana.malik@iiui.edu.pk',       '+92-303-1111004', 'election_creator', 'IIUI Islamabad',           'Departmental Society Head Elections',        true, NOW() - INTERVAL '65 days'),
  ('10000000-0000-0000-0000-000000000005', 'Usman Ghani',      'usman@psl.com.pk',             '+92-304-1111005', 'election_creator', 'PSL Community Club',       'Club President & Vice President Election',   true, NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000006', 'Ayesha Siddiqui',  'ayesha@comsats.edu.pk',        '+92-305-1111006', 'election_creator', 'COMSATS University',       'CS Dept Representative Elections',           true, NOW() - INTERVAL '55 days'),
  ('10000000-0000-0000-0000-000000000007', 'Hamza Tariq',      'hamza@paksteel.com',           '+92-306-1111007', 'election_creator', 'Pak Steel',                'Workers Union Leadership Vote',              true, NOW() - INTERVAL '50 days'),
  ('10000000-0000-0000-0000-000000000008', 'Zara Ahmed',       'zara.ahmed@lums.edu.pk',       '+92-307-1111008', 'election_creator', 'LUMS Lahore',              'Student Government Body Elections',          true, NOW() - INTERVAL '45 days'),
  ('10000000-0000-0000-0000-000000000009', 'Tariq Mehmood',    'tariq@karachichamber.com',     '+92-308-1111009', 'election_creator', 'Karachi Chamber',          'Chamber Executive Committee Election',       true, NOW() - INTERVAL '40 days'),
  ('10000000-0000-0000-0000-000000000010', 'Nadia Bashir',     'nadia.bashir@aku.edu.pk',      '+92-309-1111010', 'election_creator', 'Aga Khan University',      'Medical Students Association Election',      true, NOW() - INTERVAL '35 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 3: Voters (50 voters)
-- ============================================================
INSERT INTO profiles (id, full_name, email, phone, role, created_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Ali Hassan',          'ali.hassan@student.nust.edu.pk',    '+92-311-2001001', 'voter', NOW() - INTERVAL '78 days'),
  ('20000000-0000-0000-0000-000000000002', 'Sara Iqbal',          'sara.iqbal@student.nust.edu.pk',    '+92-312-2001002', 'voter', NOW() - INTERVAL '77 days'),
  ('20000000-0000-0000-0000-000000000003', 'Kamran Ali',          'kamran.ali@student.pu.edu.pk',      '+92-313-2001003', 'voter', NOW() - INTERVAL '76 days'),
  ('20000000-0000-0000-0000-000000000004', 'Hira Baig',           'hira.baig@employee.techcorp.pk',    '+92-314-2001004', 'voter', NOW() - INTERVAL '75 days'),
  ('20000000-0000-0000-0000-000000000005', 'Shahzaib Rizvi',      'shahzaib@student.iiui.edu.pk',      '+92-315-2001005', 'voter', NOW() - INTERVAL '74 days'),
  ('20000000-0000-0000-0000-000000000006', 'Mahnoor Qureshi',     'mahnoor@pslclub.com',               '+92-316-2001006', 'voter', NOW() - INTERVAL '73 days'),
  ('20000000-0000-0000-0000-000000000007', 'Faisal Nawaz',        'faisal.nawaz@student.comsats.pk',   '+92-317-2001007', 'voter', NOW() - INTERVAL '72 days'),
  ('20000000-0000-0000-0000-000000000008', 'Rida Zafar',          'rida.zafar@paksteel.com',           '+92-318-2001008', 'voter', NOW() - INTERVAL '71 days'),
  ('20000000-0000-0000-0000-000000000009', 'Imran Sohail',        'imran.sohail@student.lums.edu.pk',  '+92-319-2001009', 'voter', NOW() - INTERVAL '70 days'),
  ('20000000-0000-0000-0000-000000000010', 'Aroha Farooq',        'aroha.farooq@karachichamber.com',   '+92-320-2001010', 'voter', NOW() - INTERVAL '69 days'),
  ('20000000-0000-0000-0000-000000000011', 'Zubair Chaudhry',     'zubair.ch@student.nust.edu.pk',     '+92-321-2001011', 'voter', NOW() - INTERVAL '68 days'),
  ('20000000-0000-0000-0000-000000000012', 'Amna Siddiqui',       'amna.siddiqi@student.pu.edu.pk',    '+92-322-2001012', 'voter', NOW() - INTERVAL '67 days'),
  ('20000000-0000-0000-0000-000000000013', 'Hassan Mirza',        'hassan.mirza@aku.edu.pk',           '+92-323-2001013', 'voter', NOW() - INTERVAL '66 days'),
  ('20000000-0000-0000-0000-000000000014', 'Noor Jahan',          'noor.jahan@student.iiui.edu.pk',    '+92-324-2001014', 'voter', NOW() - INTERVAL '65 days'),
  ('20000000-0000-0000-0000-000000000015', 'Salman Butt',         'salman.butt@pslclub.com',           '+92-325-2001015', 'voter', NOW() - INTERVAL '64 days'),
  ('20000000-0000-0000-0000-000000000016', 'Asma Rehman',         'asma.rehman@comsats.edu.pk',        '+92-326-2001016', 'voter', NOW() - INTERVAL '63 days'),
  ('20000000-0000-0000-0000-000000000017', 'Waqar Ahmed',         'waqar.ahmed@paksteel.com',          '+92-327-2001017', 'voter', NOW() - INTERVAL '62 days'),
  ('20000000-0000-0000-0000-000000000018', 'Mehwish Shafiq',      'mehwish.sh@student.lums.edu.pk',    '+92-328-2001018', 'voter', NOW() - INTERVAL '61 days'),
  ('20000000-0000-0000-0000-000000000019', 'Adeel Sultan',        'adeel.sultan@karachichamber.com',   '+92-329-2001019', 'voter', NOW() - INTERVAL '60 days'),
  ('20000000-0000-0000-0000-000000000020', 'Sobia Noor',          'sobia.noor@aku.edu.pk',             '+92-330-2001020', 'voter', NOW() - INTERVAL '59 days'),
  ('20000000-0000-0000-0000-000000000021', 'Babar Azam',          'babar.azam@student.nust.edu.pk',    '+92-331-2001021', 'voter', NOW() - INTERVAL '58 days'),
  ('20000000-0000-0000-0000-000000000022', 'Naila Pervez',        'naila.pervez@student.pu.edu.pk',    '+92-332-2001022', 'voter', NOW() - INTERVAL '57 days'),
  ('20000000-0000-0000-0000-000000000023', 'Umar Sheikh',         'umar.sheikh@techcorp.pk',           '+92-333-2001023', 'voter', NOW() - INTERVAL '56 days'),
  ('20000000-0000-0000-0000-000000000024', 'Iqra Yousaf',         'iqra.yousaf@student.iiui.edu.pk',   '+92-334-2001024', 'voter', NOW() - INTERVAL '55 days'),
  ('20000000-0000-0000-0000-000000000025', 'Sameer Jawad',        'sameer.jawad@pslclub.com',          '+92-335-2001025', 'voter', NOW() - INTERVAL '54 days'),
  ('20000000-0000-0000-0000-000000000026', 'Farah Waheed',        'farah.waheed@student.comsats.pk',   '+92-336-2001026', 'voter', NOW() - INTERVAL '53 days'),
  ('20000000-0000-0000-0000-000000000027', 'Naeem Akhtar',        'naeem.akhtar@paksteel.com',         '+92-337-2001027', 'voter', NOW() - INTERVAL '52 days'),
  ('20000000-0000-0000-0000-000000000028', 'Lubna Arshad',        'lubna.arshad@student.lums.edu.pk',  '+92-338-2001028', 'voter', NOW() - INTERVAL '51 days'),
  ('20000000-0000-0000-0000-000000000029', 'Danish Rao',          'danish.rao@karachichamber.com',     '+92-339-2001029', 'voter', NOW() - INTERVAL '50 days'),
  ('20000000-0000-0000-0000-000000000030', 'Shumaila Bibi',       'shumaila.bibi@aku.edu.pk',          '+92-340-2001030', 'voter', NOW() - INTERVAL '49 days'),
  ('20000000-0000-0000-0000-000000000031', 'Rizwan Haider',       'rizwan.haider@student.nust.edu.pk', '+92-341-2001031', 'voter', NOW() - INTERVAL '48 days'),
  ('20000000-0000-0000-0000-000000000032', 'Tahira Parveen',      'tahira.parveen@student.pu.edu.pk',  '+92-342-2001032', 'voter', NOW() - INTERVAL '47 days'),
  ('20000000-0000-0000-0000-000000000033', 'Asjad Mehmood',       'asjad.mehmood@techcorp.pk',         '+92-343-2001033', 'voter', NOW() - INTERVAL '46 days'),
  ('20000000-0000-0000-0000-000000000034', 'Zainab Ali',          'zainab.ali@student.iiui.edu.pk',    '+92-344-2001034', 'voter', NOW() - INTERVAL '45 days'),
  ('20000000-0000-0000-0000-000000000035', 'Shoaib Akhtar',       'shoaib.akhtar@pslclub.com',         '+92-345-2001035', 'voter', NOW() - INTERVAL '44 days'),
  ('20000000-0000-0000-0000-000000000036', 'Maryam Nawaz',        'maryam.nawaz@comsats.edu.pk',       '+92-346-2001036', 'voter', NOW() - INTERVAL '43 days'),
  ('20000000-0000-0000-0000-000000000037', 'Asif Zardari Jr',     'asif.jr@paksteel.com',              '+92-347-2001037', 'voter', NOW() - INTERVAL '42 days'),
  ('20000000-0000-0000-0000-000000000038', 'Kashmala Tariq',      'kashmala@student.lums.edu.pk',      '+92-348-2001038', 'voter', NOW() - INTERVAL '41 days'),
  ('20000000-0000-0000-0000-000000000039', 'Junaid Jamshed Jr',   'junaid.jr@karachichamber.com',      '+92-349-2001039', 'voter', NOW() - INTERVAL '40 days'),
  ('20000000-0000-0000-0000-000000000040', 'Saima Waheed',        'saima.waheed@aku.edu.pk',           '+92-350-2001040', 'voter', NOW() - INTERVAL '39 days'),
  ('20000000-0000-0000-0000-000000000041', 'Pervez Musharraf Jr', 'pervez.jr@student.nust.edu.pk',     '+92-351-2001041', 'voter', NOW() - INTERVAL '38 days'),
  ('20000000-0000-0000-0000-000000000042', 'Bushra Ansari Jr',    'bushra.jr@student.pu.edu.pk',       '+92-352-2001042', 'voter', NOW() - INTERVAL '37 days'),
  ('20000000-0000-0000-0000-000000000043', 'Shahid Afridi Jr',    'shahid.jr@techcorp.pk',             '+92-353-2001043', 'voter', NOW() - INTERVAL '36 days'),
  ('20000000-0000-0000-0000-000000000044', 'Hania Amir',          'hania.amir@student.iiui.edu.pk',    '+92-354-2001044', 'voter', NOW() - INTERVAL '35 days'),
  ('20000000-0000-0000-0000-000000000045', 'Wahab Riaz',          'wahab.riaz@pslclub.com',            '+92-355-2001045', 'voter', NOW() - INTERVAL '34 days'),
  ('20000000-0000-0000-0000-000000000046', 'Nimra Khan',          'nimra.khan@comsats.edu.pk',         '+92-356-2001046', 'voter', NOW() - INTERVAL '33 days'),
  ('20000000-0000-0000-0000-000000000047', 'Fahad Mustafa',       'fahad.mustafa@paksteel.com',        '+92-357-2001047', 'voter', NOW() - INTERVAL '32 days'),
  ('20000000-0000-0000-0000-000000000048', 'Areeba Habib',        'areeba.habib@student.lums.edu.pk',  '+92-358-2001048', 'voter', NOW() - INTERVAL '31 days'),
  ('20000000-0000-0000-0000-000000000049', 'Yasir Shah',          'yasir.shah@karachichamber.com',     '+92-359-2001049', 'voter', NOW() - INTERVAL '30 days'),
  ('20000000-0000-0000-0000-000000000050', 'Mahira Khan',         'mahira.khan@aku.edu.pk',            '+92-360-2001050', 'voter', NOW() - INTERVAL '29 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 4: Elections (6 elections — various statuses)
-- ============================================================
INSERT INTO elections (id, creator_id, title, description, category, start_date, end_date, registration_deadline, max_voters, status, is_locked, created_at) VALUES

  -- Election 1: ACTIVE — NUST Student Council
  ('E0000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'NUST Student Council Elections 2025',
   'Annual elections for the NUST Student Council. Students vote for President, VP, and General Secretary.',
   'Academic',
   NOW() - INTERVAL '3 days',
   NOW() + INTERVAL '4 days',
   NOW() - INTERVAL '5 days',
   500, 'active', false, NOW() - INTERVAL '15 days'),

  -- Election 2: ACTIVE — Punjab University Faculty
  ('E0000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002',
   'Punjab University Faculty Senate 2025',
   'Election for the Faculty Senate representing all academic departments in the university.',
   'Academic',
   NOW() - INTERVAL '2 days',
   NOW() + INTERVAL '5 days',
   NOW() - INTERVAL '4 days',
   200, 'active', false, NOW() - INTERVAL '20 days'),

  -- Election 3: COMPLETED — TechCorp Board
  ('E0000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000003',
   'TechCorp Pakistan Board of Directors',
   'Shareholder vote for the new Board of Directors for FY 2025-2026.',
   'Corporate',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '10 days',
   NOW() - INTERVAL '22 days',
   100, 'completed', true, NOW() - INTERVAL '30 days'),

  -- Election 4: UPCOMING — LUMS Student Government
  ('E0000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000008',
   'LUMS Student Government Body 2025',
   'Elect the Student Government Body representatives for the upcoming academic year.',
   'Academic',
   NOW() + INTERVAL '7 days',
   NOW() + INTERVAL '14 days',
   NOW() + INTERVAL '5 days',
   800, 'published', false, NOW() - INTERVAL '10 days'),

  -- Election 5: COMPLETED — PSL Club President
  ('E0000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005',
   'PSL Community Club President Election',
   'Members vote for Club President and Vice President for the 2025-26 season.',
   'Social',
   NOW() - INTERVAL '30 days',
   NOW() - INTERVAL '20 days',
   NOW() - INTERVAL '32 days',
   150, 'completed', true, NOW() - INTERVAL '40 days'),

  -- Election 6: ACTIVE — Karachi Chamber
  ('E0000000-0000-0000-0000-000000000006',
   '10000000-0000-0000-0000-000000000009',
   'Karachi Chamber Executive Committee 2025',
   'Election for the executive committee members of Karachi Chamber of Commerce.',
   'Corporate',
   NOW() - INTERVAL '1 day',
   NOW() + INTERVAL '6 days',
   NOW() - INTERVAL '3 days',
   300, 'active', false, NOW() - INTERVAL '12 days')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 5: Candidates
-- ============================================================
INSERT INTO candidates (id, election_id, name, designation, manifesto) VALUES

  -- NUST Election candidates
  ('C1000001-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000001', 'Usman Khalid',    'CS Final Year',          'I will modernize student facilities and establish a tech incubator on campus.'),
  ('C1000001-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000001', 'Aisha Rauf',      'EE Final Year',          'Focus on inclusivity, merit-based scholarships, and stronger alumni network.'),
  ('C1000001-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000001', 'Saad Bin Farooq', 'Management Sciences',    'Better cafeteria, sports complex expansion, and faculty-student collaboration.'),

  -- Punjab University Faculty candidates
  ('C1000002-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000002', 'Dr. Nargis Rehman',   'Professor, Chemistry',  'Champion research funding and academic freedom across all faculties.'),
  ('C1000002-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000002', 'Dr. Khalid Jamil',    'Associate Prof, CS',    'Digitize university processes and improve inter-department collaboration.'),
  ('C1000002-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000002', 'Dr. Sadia Anwar',     'Prof, Economics',       'Focus on student welfare policies and faculty compensation reform.'),

  -- TechCorp Board candidates
  ('C1000003-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000003', 'Farhan Qureshi',   'CFO',                   'Drive sustainable growth, reduce operational costs, expand to GCC markets.'),
  ('C1000003-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000003', 'Maria Younis',     'CTO',                   'Lead digital transformation and AI adoption across all business units.'),
  ('C1000003-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000003', 'Kamal Sabir',      'COO',                   'Streamline operations, strengthen supply chain resilience.'),

  -- LUMS Student Government candidates
  ('C1000004-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000004', 'Zara Jamal',      'BBA Junior',            'Free mental health counseling, better placement cell, and green campus initiative.'),
  ('C1000004-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000004', 'Ibrahim Rauf',    'BSc CS Senior',         'Online student portal, 24/7 library access, and more industry partnerships.'),
  ('C1000004-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000004', 'Nadia Hamid',     'LLB Senior',            'Improve complaint resolution system and strengthen student rights charter.'),

  -- PSL Club candidates
  ('C1000005-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000005', 'Junaid Akram',    'Senior Member',         'Organize more community cricket events and expand club membership.'),
  ('C1000005-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000005', 'Ramiz Raja Jr',   'Board Member',          'Bring international teams for exhibition matches and grow club revenue.'),

  -- Karachi Chamber candidates
  ('C1000006-0000-0000-0000-000000000001', 'E0000000-0000-0000-0000-000000000006', 'Khalid Maqbool',  'Textile Sector Rep',    'Lobby for export tax relief and strengthen CPEC business corridors.'),
  ('C1000006-0000-0000-0000-000000000002', 'E0000000-0000-0000-0000-000000000006', 'Amina Saeed',     'IT Sector Rep',         'Digitize chamber services and attract foreign direct investment in tech.'),
  ('C1000006-0000-0000-0000-000000000003', 'E0000000-0000-0000-0000-000000000006', 'Tariq Farooqui',  'Manufacturing Rep',     'Reduce energy costs for manufacturers and improve port logistics.')

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 6: Voter Registrations (approved — for completed & active elections)
-- ============================================================

-- NUST Election — 15 voters registered & approved
INSERT INTO voter_registrations (election_id, user_id, secret_id_hash, masked_secret_id, status, registered_at) VALUES
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', encode(sha256('NUST-A-0001'), 'base64'), '****0001', 'approved', NOW() - INTERVAL '13 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', encode(sha256('NUST-A-0002'), 'base64'), '****0002', 'approved', NOW() - INTERVAL '13 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', encode(sha256('NUST-A-0003'), 'base64'), '****0003', 'approved', NOW() - INTERVAL '12 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000011', encode(sha256('NUST-A-0004'), 'base64'), '****0004', 'approved', NOW() - INTERVAL '12 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000021', encode(sha256('NUST-A-0005'), 'base64'), '****0005', 'approved', NOW() - INTERVAL '11 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000031', encode(sha256('NUST-A-0006'), 'base64'), '****0006', 'approved', NOW() - INTERVAL '11 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000041', encode(sha256('NUST-A-0007'), 'base64'), '****0007', 'approved', NOW() - INTERVAL '10 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000012', encode(sha256('NUST-A-0008'), 'base64'), '****0008', 'approved', NOW() - INTERVAL '10 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000022', encode(sha256('NUST-A-0009'), 'base64'), '****0009', 'pending',  NOW() - INTERVAL '9 days'),
  ('E0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000032', encode(sha256('NUST-A-0010'), 'base64'), '****0010', 'pending',  NOW() - INTERVAL '8 days')
ON CONFLICT (election_id, user_id) DO NOTHING;

-- Punjab University — 10 voters
INSERT INTO voter_registrations (election_id, user_id, secret_id_hash, masked_secret_id, status, registered_at) VALUES
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', encode(sha256('PU-B-0001'), 'base64'), '****0001', 'approved', NOW() - INTERVAL '18 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000005', encode(sha256('PU-B-0002'), 'base64'), '****0002', 'approved', NOW() - INTERVAL '17 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000013', encode(sha256('PU-B-0003'), 'base64'), '****0003', 'approved', NOW() - INTERVAL '17 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000023', encode(sha256('PU-B-0004'), 'base64'), '****0004', 'approved', NOW() - INTERVAL '16 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000033', encode(sha256('PU-B-0005'), 'base64'), '****0005', 'approved', NOW() - INTERVAL '16 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000043', encode(sha256('PU-B-0006'), 'base64'), '****0006', 'pending',  NOW() - INTERVAL '15 days'),
  ('E0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000014', encode(sha256('PU-B-0007'), 'base64'), '****0007', 'pending',  NOW() - INTERVAL '14 days')
ON CONFLICT (election_id, user_id) DO NOTHING;

-- TechCorp Board (completed) — 20 voters
INSERT INTO voter_registrations (election_id, user_id, secret_id_hash, masked_secret_id, status, registered_at) VALUES
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', encode(sha256('TC-C-0001'), 'base64'), '****0001', 'approved', NOW() - INTERVAL '28 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', encode(sha256('TC-C-0002'), 'base64'), '****0002', 'approved', NOW() - INTERVAL '28 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', encode(sha256('TC-C-0003'), 'base64'), '****0003', 'approved', NOW() - INTERVAL '27 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000015', encode(sha256('TC-C-0004'), 'base64'), '****0004', 'approved', NOW() - INTERVAL '27 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000016', encode(sha256('TC-C-0005'), 'base64'), '****0005', 'approved', NOW() - INTERVAL '26 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000017', encode(sha256('TC-C-0006'), 'base64'), '****0006', 'approved', NOW() - INTERVAL '26 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000024', encode(sha256('TC-C-0007'), 'base64'), '****0007', 'approved', NOW() - INTERVAL '25 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000025', encode(sha256('TC-C-0008'), 'base64'), '****0008', 'approved', NOW() - INTERVAL '25 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000026', encode(sha256('TC-C-0009'), 'base64'), '****0009', 'approved', NOW() - INTERVAL '24 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000034', encode(sha256('TC-C-0010'), 'base64'), '****0010', 'approved', NOW() - INTERVAL '24 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000035', encode(sha256('TC-C-0011'), 'base64'), '****0011', 'approved', NOW() - INTERVAL '23 days'),
  ('E0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000036', encode(sha256('TC-C-0012'), 'base64'), '****0012', 'approved', NOW() - INTERVAL '23 days')
ON CONFLICT (election_id, user_id) DO NOTHING;

-- PSL Club (completed) — 18 voters
INSERT INTO voter_registrations (election_id, user_id, secret_id_hash, masked_secret_id, status, registered_at) VALUES
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009', encode(sha256('PSL-E-0001'), 'base64'), '****0001', 'approved', NOW() - INTERVAL '38 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000010', encode(sha256('PSL-E-0002'), 'base64'), '****0002', 'approved', NOW() - INTERVAL '37 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000018', encode(sha256('PSL-E-0003'), 'base64'), '****0003', 'approved', NOW() - INTERVAL '37 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000019', encode(sha256('PSL-E-0004'), 'base64'), '****0004', 'approved', NOW() - INTERVAL '36 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000027', encode(sha256('PSL-E-0005'), 'base64'), '****0005', 'approved', NOW() - INTERVAL '36 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000028', encode(sha256('PSL-E-0006'), 'base64'), '****0006', 'approved', NOW() - INTERVAL '35 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000037', encode(sha256('PSL-E-0007'), 'base64'), '****0007', 'approved', NOW() - INTERVAL '35 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000038', encode(sha256('PSL-E-0008'), 'base64'), '****0008', 'approved', NOW() - INTERVAL '34 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000045', encode(sha256('PSL-E-0009'), 'base64'), '****0009', 'approved', NOW() - INTERVAL '34 days'),
  ('E0000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000046', encode(sha256('PSL-E-0010'), 'base64'), '****0010', 'approved', NOW() - INTERVAL '33 days')
ON CONFLICT (election_id, user_id) DO NOTHING;

-- ============================================================
-- STEP 7: Votes for COMPLETED elections
-- (TechCorp Board + PSL Club — these are done)
-- ============================================================

-- TechCorp Board votes (Maria Younis wins with 7 votes)
INSERT INTO votes (election_id, candidate_id, voter_hash, created_at) VALUES
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000006-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '15 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000007-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '15 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000008-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '14 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000015-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '14 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000016-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '13 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000003', encode(sha256('20000000-0000-0000-0000-000000000017-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '13 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000024-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '12 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000025-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '12 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000026-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '11 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000003', encode(sha256('20000000-0000-0000-0000-000000000034-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '11 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000035-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '10 days'),
  ('E0000000-0000-0000-0000-000000000003', 'C1000003-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000036-E0000000-0000-0000-0000-000000000003'), 'base64'), NOW() - INTERVAL '10 days')
ON CONFLICT (election_id, voter_hash) DO NOTHING;

-- PSL Club votes (Junaid Akram wins with 7 votes)
INSERT INTO votes (election_id, candidate_id, voter_hash, created_at) VALUES
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000009-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '25 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000010-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '25 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000018-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '24 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000019-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '24 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000027-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '23 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000028-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '23 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000037-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '22 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000038-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '22 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000002', encode(sha256('20000000-0000-0000-0000-000000000045-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '21 days'),
  ('E0000000-0000-0000-0000-000000000005', 'C1000005-0000-0000-0000-000000000001', encode(sha256('20000000-0000-0000-0000-000000000046-E0000000-0000-0000-0000-000000000005'), 'base64'), NOW() - INTERVAL '21 days')
ON CONFLICT (election_id, voter_hash) DO NOTHING;

-- ============================================================
-- STEP 8: Audit Logs (activity trail)
-- ============================================================
INSERT INTO audit_logs (action, user_id, metadata, ip_address, timestamp) VALUES
  ('USER_SIGNUP',         '10000000-0000-0000-0000-000000000001', '{"role":"election_creator","org":"NUST University"}',          '123.45.67.1',  NOW() - INTERVAL '80 days'),
  ('CREATOR_APPROVED',    '00000000-0000-0000-0000-000000000001', '{"creator_id":"10000000-0000-0000-0000-000000000001"}',         '123.45.67.100',NOW() - INTERVAL '79 days'),
  ('CREATOR_APPROVED',    '00000000-0000-0000-0000-000000000001', '{"creator_id":"10000000-0000-0000-0000-000000000002"}',         '123.45.67.100',NOW() - INTERVAL '74 days'),
  ('CREATOR_APPROVED',    '00000000-0000-0000-0000-000000000001', '{"creator_id":"10000000-0000-0000-0000-000000000003"}',         '123.45.67.100',NOW() - INTERVAL '69 days'),
  ('ELECTION_UPDATED',    '10000000-0000-0000-0000-000000000001', '{"election_id":"E0000000-0000-0000-0000-000000000001","status":"active"}','192.168.1.5', NOW() - INTERVAL '15 days'),
  ('VOTER_APPROVED',      '10000000-0000-0000-0000-000000000001', '{"voter_id":"20000000-0000-0000-0000-000000000001","election":"NUST Student Council"}','192.168.1.5', NOW() - INTERVAL '13 days'),
  ('VOTER_APPROVED',      '10000000-0000-0000-0000-000000000001', '{"voter_id":"20000000-0000-0000-0000-000000000002","election":"NUST Student Council"}','192.168.1.5', NOW() - INTERVAL '13 days'),
  ('VOTE_CAST',           NULL,                                   '{"election_id":"E0000000-0000-0000-0000-000000000003","anonymous":true}','45.23.11.88', NOW() - INTERVAL '15 days'),
  ('VOTE_CAST',           NULL,                                   '{"election_id":"E0000000-0000-0000-0000-000000000003","anonymous":true}','45.23.11.89', NOW() - INTERVAL '15 days'),
  ('VOTE_CAST',           NULL,                                   '{"election_id":"E0000000-0000-0000-0000-000000000005","anonymous":true}','45.23.11.90', NOW() - INTERVAL '25 days'),
  ('USER_LOGIN',          '10000000-0000-0000-0000-000000000001', '{"email":"ahmed.raza@nust.edu.pk"}',                           '192.168.1.5',  NOW() - INTERVAL '1 day'),
  ('USER_LOGIN',          '20000000-0000-0000-0000-000000000001', '{"email":"ali.hassan@student.nust.edu.pk"}',                   '192.168.1.22', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION QUERY — Run this to confirm data loaded
-- ============================================================
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'election_creator') as creators,
  (SELECT COUNT(*) FROM profiles WHERE role = 'voter')            as voters,
  (SELECT COUNT(*) FROM elections)                                 as elections,
  (SELECT COUNT(*) FROM candidates)                               as candidates,
  (SELECT COUNT(*) FROM voter_registrations)                      as registrations,
  (SELECT COUNT(*) FROM votes)                                     as votes,
  (SELECT COUNT(*) FROM audit_logs)                               as audit_logs;
