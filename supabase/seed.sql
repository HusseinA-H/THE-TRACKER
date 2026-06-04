-- Seed default system exercises
-- is_custom = FALSE, user_id = NULL
-- Rebuilt from MASTER_WORKOUT_TEMPLATE.md with additional fields for Exercise Database

-- Remove all old standard default exercises first to ensure the library exactly matches
DELETE FROM public.exercises WHERE is_custom = FALSE AND user_id IS NULL;

-- Insert the 30 standardized exercises with detailed columns
INSERT INTO public.exercises (
    id, user_id, name, primary_muscle_group, secondary_muscle_group, description, video_url, is_custom,
    category, equipment, difficulty, alternative_exercise, notes
) VALUES
('e2e00001-0000-4000-8000-000000000001', NULL, 'Chest Bar Flat Press', 'Chest', 'Shoulders', 'A flat press variation using a machine or barbell to target the pectorals.', NULL, FALSE, 'Upper', 'Machine', 'Beginner', 'Bench Press (Barbell)', 'Keep elbows slightly tucked. Press smoothly.'),
('e2e00001-0000-4000-8000-000000000002', NULL, 'T-Bar Row', 'Back', 'Arms', 'A rowing exercise performed with a T-bar setup to build back thickness.', NULL, FALSE, 'Upper', 'Barbell', 'Intermediate', 'Bent Over Row', 'Pull to lower chest, squeeze shoulder blades.'),
('e2e00001-0000-4000-8000-000000000003', NULL, 'Butterfly', 'Chest', 'Shoulders', 'An isolation chest fly exercise targeting the pectoralis major.', NULL, FALSE, 'Upper', 'Machine', 'Beginner', 'Dumbbell Fly', 'Focus on the squeeze at the peak contraction.'),
('e2e00001-0000-4000-8000-000000000004', NULL, 'Lat Pulldown', 'Back', 'Arms', 'A vertical pull down exercise focusing on the latissimus dorsi.', NULL, FALSE, 'Upper', 'Cable', 'Beginner', 'Pull-Up', 'Pull to upper chest, keep torso upright.'),
('e2e00001-0000-4000-8000-000000000005', NULL, 'Incline Machine Press', 'Chest', 'Shoulders', 'An inclined machine chest press targeting the upper pectorals.', NULL, FALSE, 'Upper', 'Machine', 'Beginner', 'Incline Dumbbell Press', 'Targets the upper chest fibers.'),
('e2e00001-0000-4000-8000-000000000006', NULL, 'Lateral Raise', 'Shoulders', 'Arms', 'An isolation exercise targeting the lateral deltoids for shoulder width.', NULL, FALSE, 'Upper', 'Dumbbell', 'Beginner', 'Cable Lateral Raise', 'Lead with the elbows, raise to parallel.'),
('e2e00001-0000-4000-8000-000000000007', NULL, 'Face Away Cable Raise', 'Shoulders', 'Arms', 'A cable lateral raise performed facing away from the pulley for constant tension.', NULL, FALSE, 'Upper', 'Cable', 'Intermediate', 'Lateral Raise', 'Maintains continuous tension on lateral delt.'),
('e2e00001-0000-4000-8000-000000000008', NULL, 'V-Bar Pushdown', 'Arms', 'Shoulders', 'A cable triceps pushdown variation using a V-bar attachment.', NULL, FALSE, 'Upper', 'Cable', 'Beginner', 'Rope Pushdown', 'Keep elbows locked at sides.'),
('e2e00001-0000-4000-8000-000000000009', NULL, 'Leg Press', 'Legs', 'Core', 'A compound leg press exercise targeting the quadriceps and glutes.', NULL, FALSE, 'Lower', 'Machine', 'Beginner', 'Squat (Barbell)', 'Do not lock out knees at the top.'),
('e2e00001-0000-4000-8000-000000000010', NULL, 'Seated Leg Curl', 'Legs', 'Core', 'An isolation exercise to strengthen the hamstrings in a seated position.', NULL, FALSE, 'Lower', 'Machine', 'Beginner', 'Lying Leg Curl', 'Squeeze hamstrings at bottom, control return.'),
('e2e00001-0000-4000-8000-000000000011', NULL, 'Leg Extension', 'Legs', 'Core', 'An isolation machine exercise targeting the quadriceps.', NULL, FALSE, 'Lower', 'Machine', 'Beginner', 'Goblet Squat', 'Hold peak contraction for 1 second.'),
('e2e00001-0000-4000-8000-000000000012', NULL, 'Hip Adduction', 'Legs', 'Core', 'An isolation movement targeting the inner thigh adductor muscles.', NULL, FALSE, 'Lower', 'Machine', 'Beginner', 'Cossack Squat', 'Builds adductor and hip stability.'),
('e2e00001-0000-4000-8000-000000000013', NULL, 'Leg Press Calf Raises', 'Legs', 'Core', 'Calf raises performed on a leg press machine to isolate the calves.', NULL, FALSE, 'Lower', 'Machine', 'Beginner', 'Standing Calf Raise', 'Pause at full stretch and full contraction.'),
('e2e00001-0000-4000-8000-000000000014', NULL, 'Shoulder Press', 'Shoulders', 'Arms', 'An overhead press variation targeting the anterior deltoids.', NULL, FALSE, 'Upper', 'Dumbbell', 'Beginner', 'Overhead Press', 'Press straight up, control the eccentric.'),
('e2e00001-0000-4000-8000-000000000015', NULL, 'SA Rear Delt Fly', 'Shoulders', 'Back', 'A single-arm rear delt fly targeting the posterior deltoids.', NULL, FALSE, 'Upper', 'Cable', 'Intermediate', 'Rear Delt Fly (Dumbbell)', 'Isolates posterior deltoid with cable tension.'),
('e2e00001-0000-4000-8000-000000000016', NULL, 'Overhead Extension', 'Arms', 'Shoulders', 'A triceps extension targeting the long head in an overhead position.', NULL, FALSE, 'Upper', 'Dumbbell', 'Intermediate', 'Lying Triceps Extension', 'Emphasizes the long head stretch.'),
('e2e00001-0000-4000-8000-000000000017', NULL, 'Face Away Curl', 'Arms', 'Shoulders', 'A bicep curl variation performed facing away from a cable pulley.', NULL, FALSE, 'Upper', 'Cable', 'Intermediate', 'Bicep Curl (Dumbbell)', 'Keep elbow behind torso for shoulder extension stretch.'),
('e2e00001-0000-4000-8000-000000000018', NULL, 'Reverse Grip Curl', 'Arms', 'Shoulders', 'A curl variation using an overhand grip to target the brachioradialis and forearms.', NULL, FALSE, 'Upper', 'Barbell', 'Beginner', 'Hammer Curl', 'Pronated grip targets brachioradialis.'),
('e2e00001-0000-4000-8000-000000000019', NULL, 'Wrist Curl', 'Arms', 'Shoulders', 'An isolation exercise to strengthen the wrist flexor and forearm muscles.', NULL, FALSE, 'Upper', 'Dumbbell', 'Beginner', 'Reverse Wrist Curl', 'Isolates forearm flexors.'),
('e2e00001-0000-4000-8000-000000000020', NULL, 'SLDL', 'Legs', 'Back', 'Stiff-Legged Deadlift targeting the hamstrings and lower back.', NULL, FALSE, 'Lower', 'Barbell', 'Intermediate', 'Deadlift (Barbell)', 'Hinge at hips, keep back flat.'),
('e2e00001-0000-4000-8000-000000000021', NULL, 'Single Lat Row', 'Back', 'Arms', 'A unilateral row exercise to isolate and build the latissimus dorsi.', NULL, FALSE, 'Upper', 'Dumbbell', 'Intermediate', 'One-Arm Dumbbell Row', 'Pull dumbbell to hip, keeping elbow close.'),
('e2e00001-0000-4000-8000-000000000022', NULL, 'Machine Pullover', 'Back', 'Arms', 'A pullover movement targeting the latissimus dorsi through a full range of motion.', NULL, FALSE, 'Upper', 'Machine', 'Intermediate', 'Dumbbell Pullover', 'Squeeze lats at bottom of movement.'),
('e2e00001-0000-4000-8000-000000000023', NULL, 'Shrugs', 'Shoulders', 'Back', 'An exercise focusing on the upper trapezius muscles.', NULL, FALSE, 'Upper', 'Dumbbell', 'Beginner', 'Barbell Shrugs', 'Shrug straight up, do not roll shoulders.'),
('e2e00001-0000-4000-8000-000000000024', NULL, 'Incline Walking', 'Cardio', 'Legs', 'Aerobic training performed by walking on an inclined treadmill.', NULL, FALSE, 'Cardio', 'Treadmill', 'Beginner', 'Cycling', 'Cardiovascular conditioning.'),
('e2e00001-0000-4000-8000-000000000025', NULL, 'Cable Crunch', 'Core', 'Back', 'A cable-loaded abdominal crunch targeting the rectus abdominis.', NULL, FALSE, 'Cardio', 'Cable', 'Beginner', 'Crunch', 'Flex spine, do not pull with hips.'),
('e2e00001-0000-4000-8000-000000000026', NULL, 'Hanging Leg Raise', 'Core', 'Legs', 'A core stability movement targeting the lower abdominals and hip flexors.', NULL, FALSE, 'Cardio', 'Bodyweight', 'Intermediate', 'Lying Leg Raise', 'Raise legs to parallel, avoid swinging.'),
('e2e00001-0000-4000-8000-000000000027', NULL, 'Ab Wheel Rollout', 'Core', 'Back', 'An rollout exercise targeting abdominal anti-extension strength.', NULL, FALSE, 'Cardio', 'Bodyweight', 'Advanced', 'Plank', 'Brace core, do not sag lower back.'),
('e2e00001-0000-4000-8000-000000000028', NULL, 'Plank', 'Core', 'Legs', 'An isometric hold exercise targeting core endurance and stability.', NULL, FALSE, 'Cardio', 'Bodyweight', 'Beginner', 'Side Plank', 'Hold straight line from head to heels.'),
('e2e00001-0000-4000-8000-000000000029', NULL, 'Pallof Press', 'Core', 'Shoulders', 'An anti-rotation core exercise performed with a cable or band.', NULL, FALSE, 'Cardio', 'Cable', 'Intermediate', 'Rotational Plank', 'Resist rotation as you press cable forward.'),
('e2e00001-0000-4000-8000-000000000030', NULL, 'Farmer Walk', 'Core', 'Arms', 'A loaded carry movement building grip strength and core stability.', NULL, FALSE, 'Cardio', 'Dumbbell', 'Beginner', 'Suitcase Carry', 'Walk with upright posture and brace core.');

-- Delete old predefined templates and relations to prevent key constraint violations
DELETE FROM public.workout_template_exercises WHERE template_id IN (
    'e2e00002-0000-4000-8000-000000000001',
    'e2e00002-0000-4000-8000-000000000002',
    'e2e00002-0000-4000-8000-000000000003',
    'e2e00002-0000-4000-8000-000000000004',
    'e2e00002-0000-4000-8000-000000000005',
    'e2e00002-0000-4000-8000-000000000006'
);
DELETE FROM public.workout_templates WHERE id IN (
    'e2e00002-0000-4000-8000-000000000001',
    'e2e00002-0000-4000-8000-000000000002',
    'e2e00002-0000-4000-8000-000000000003',
    'e2e00002-0000-4000-8000-000000000004',
    'e2e00002-0000-4000-8000-000000000005',
    'e2e00002-0000-4000-8000-000000000006'
);

-- Insert predefined templates
INSERT INTO public.workout_templates (id, user_id, name, description, estimated_duration, muscle_focus) VALUES
('e2e00002-0000-4000-8000-000000000001', NULL, 'Upper A', 'Hypertrophy rotation Upper Day A focusing on Chest, Back, Side Delts and Triceps.', 60, 'Chest, Back, Shoulders, Arms'),
('e2e00002-0000-4000-8000-000000000002', NULL, 'Lower A', 'Hypertrophy rotation Lower Day A focusing on Quads, Hamstrings, Glutes, and Calves.', 50, 'Legs'),
('e2e00002-0000-4000-8000-000000000003', NULL, 'Upper B', 'Hypertrophy rotation Upper Day B focusing on Shoulders, Arms, and Forearms.', 65, 'Shoulders, Arms, Forearms'),
('e2e00002-0000-4000-8000-000000000004', NULL, 'Lower B', 'Hypertrophy rotation Lower Day B focusing on Hamstrings, Quads, and Calves.', 50, 'Legs'),
('e2e00002-0000-4000-8000-000000000005', NULL, 'Upper C', 'Hypertrophy rotation Upper Day C focusing on Chest, Back, Arms, and traps.', 60, 'Chest, Back, Arms'),
('e2e00002-0000-4000-8000-000000000006', NULL, 'Cardio + Abs', 'Aerobic walking and direct core conditioning routine.', 45, 'Core, Cardio');

-- Insert template exercises
INSERT INTO public.workout_template_exercises (template_id, exercise_id, sequence_number, target_sets, target_reps, warmup_sets, working_sets) VALUES
-- Upper A
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000001', 1, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000002', 2, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000003', 3, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000004', 4, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000005', 5, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000006', 6, 3, '10-12', 0, 3),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000007', 7, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000001', 'e2e00001-0000-4000-8000-000000000008', 8, 4, '10-12', 0, 4),

-- Lower A
('e2e00002-0000-4000-8000-000000000002', 'e2e00001-0000-4000-8000-000000000009', 1, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000002', 'e2e00001-0000-4000-8000-000000000010', 2, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000002', 'e2e00001-0000-4000-8000-000000000011', 3, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000002', 'e2e00001-0000-4000-8000-000000000012', 4, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000002', 'e2e00001-0000-4000-8000-000000000013', 5, 5, '10-12', 0, 5),

-- Upper B
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000014', 1, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000006', 2, 3, '10-12', 0, 3),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000015', 3, 3, '10-12', 0, 3),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000007', 4, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000016', 5, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000008', 6, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000017', 7, 2, '10-12', 0, 2),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000018', 8, 2, '10-12', 0, 2),
('e2e00002-0000-4000-8000-000000000003', 'e2e00001-0000-4000-8000-000000000019', 9, 2, '10-12', 0, 2),

-- Lower B
('e2e00002-0000-4000-8000-000000000004', 'e2e00001-0000-4000-8000-000000000020', 1, 5, '8-12', 0, 5),
('e2e00002-0000-4000-8000-000000000004', 'e2e00001-0000-4000-8000-000000000010', 2, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000004', 'e2e00001-0000-4000-8000-000000000011', 3, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000004', 'e2e00001-0000-4000-8000-000000000012', 4, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000004', 'e2e00001-0000-4000-8000-000000000013', 5, 5, '10-12', 0, 5),

-- Upper C
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000001', 1, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000002', 2, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000003', 3, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000021', 4, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000005', 5, 5, '10-12', 0, 5),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000022', 6, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000023', 7, 4, '10-12', 0, 4),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000018', 8, 2, '10-12', 0, 2),
('e2e00002-0000-4000-8000-000000000005', 'e2e00001-0000-4000-8000-000000000019', 9, 2, '10-12', 0, 2),

-- Cardio + Abs
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000024', 1, 1, '25-30 Min', 0, 1),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000025', 2, 4, '12-15', 0, 4),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000026', 3, 3, '10-15', 0, 3),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000027', 4, 3, '8-12', 0, 3),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000028', 5, 3, '45-60 Sec', 0, 3),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000029', 6, 3, '10-12', 0, 3),
('e2e00002-0000-4000-8000-000000000006', 'e2e00001-0000-4000-8000-000000000030', 7, 3, 'Rounds', 0, 3);

