import {

  Profile,

  Exam,

  Question,

  QuestionOption,

  ExamAttempt,

  Answer,

  Assignment,

  AssignmentSubmission,

  Notification,

  StoredFile,
  Lesson,

  UserRole

} from '../types/database';

import { supabase } from '../lib/supabase';

/* =========================================================

   Runtime cache only

   ---------------------------------------------------------

   Supabase = persistent source of truth.

   This Map exists only to keep the current synchronous UI API

   working without forcing the whole React app to become async.

   Nothing here survives a refresh.

========================================================= */

const KEYS = {

  PROFILES: 'mindcraft_profiles',

  EXAMS: 'mindcraft_exams',

  QUESTIONS: 'mindcraft_questions',

  ASSIGNMENTS: 'mindcraft_assignments',

  ATTEMPTS: 'mindcraft_exam_attempts',

  ASSIGNMENT_SUBMISSIONS: 'mindcraft_assignment_submissions',

  NOTIFICATIONS: 'mindcraft_notifications',

  FILES: 'mindcraft_files',

  CURRENT_USER: 'mindcraft_current_user',

  ADMIN_SESSION: 'mindcraft_admin_session_auth',
  LESSONS: 'mindcraft_lessons',

};

class DatabaseService {

  private memory = new Map<string, string>();

  constructor() {

    this.initDatabase();

  }

  private read(key: string): string | null {

    return this.memory.get(key) ?? null;

  }

  private write(key: string, value: string): void {

    this.memory.set(key, value);

  }

  private remove(key: string): void {

    this.memory.delete(key);

  }

  /**

   * Runtime cache only.

   * IMPORTANT: this does NOT write to localStorage/sessionStorage

   * and does NOT represent persistent application storage.

   */

  private persist(key: string, value: string): void {

    this.write(key, value);

  }

  private initDatabase(): void {

    [
      KEYS.LESSONS,

      KEYS.PROFILES,

      KEYS.EXAMS,

      KEYS.QUESTIONS,

      KEYS.ASSIGNMENTS,

      KEYS.ATTEMPTS,

      KEYS.ASSIGNMENT_SUBMISSIONS,

      KEYS.NOTIFICATIONS,

      KEYS.FILES

    ].forEach(key => this.write(key, '[]'));

  }

  private requireSupabase() {

    if (!supabase) {

      throw new Error(

        'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'

      );

    }

    return supabase;

  }

  /* =========================================================

     HYDRATION

  ========================================================= */

  public async hydrateFromSupabase(): Promise<void> {

    const client = this.requireSupabase();

    const { data: authData, error: authError } =

      await client.auth.getUser();

    if (authError) throw authError;

    if (!authData.user) return;

    const [

      profilesR,

      examsR,

      questionsR,

      optionsR,

      attemptsR,

      answersR,

      lessonsR,

      assignmentsR,

      submissionsR,

      notificationsR

    ] = await Promise.all([

      client.from('profiles').select('*'),

      client

        .from('exams')

        .select('*')

        .order('created_at', { ascending: false }),

      client

        .from('questions')

        .select('*')

        .order('order_index', { ascending: true }),

      client

        .from('question_options')

        .select('*')

        .order('order_index', { ascending: true }),

      client

        .from('exam_attempts')

        .select('*')

        .order('started_at', { ascending: false }),

      client.from('answers').select('*'),

      client

        .from('lessons')

        .select('*')

        .order('created_at', { ascending: false }),

      client

        .from('assignments')

        .select('*')

        .order('created_at', { ascending: false }),

      client

        .from('assignment_submissions')

        .select('*')

        .order('submitted_at', { ascending: false }),

      client

        .from('notifications')

        .select('*')

        .order('created_at', { ascending: false })

    ]);

    const results = [

      profilesR,

      examsR,

      questionsR,

      optionsR,

      attemptsR,

      answersR,
      

      lessonsR,

      assignmentsR,

      submissionsR,

      notificationsR

    ];

    for (const result of results) {

      if (result.error) {

        console.error('Supabase hydrate error:', result.error);

        throw result.error;

      }

    }

    const profiles = profilesR.data || [];

    const exams = examsR.data || [];

    const options = optionsR.data || [];

    const questions: Question[] = (questionsR.data || []).map(

      (question: any) => ({

        ...question,

        options: options.filter(

          (option: any) => option.question_id === question.id

        )

      })

    );

    const answers = answersR.data || [];

    const attempts: ExamAttempt[] = (attemptsR.data || []).map(

      (attempt: any) => ({

        ...attempt,

        answers: answers.filter(

          (answer: any) => answer.attempt_id === attempt.id

        )

      })

    );

    this.write(KEYS.PROFILES, JSON.stringify(profiles));

    this.write(KEYS.EXAMS, JSON.stringify(exams));

    this.write(KEYS.QUESTIONS, JSON.stringify(questions));

    this.write(KEYS.ATTEMPTS, JSON.stringify(attempts));

    this.write(

      KEYS.ASSIGNMENTS,

      JSON.stringify(assignmentsR.data || [])

    );

    this.write(

      KEYS.ASSIGNMENT_SUBMISSIONS,

      JSON.stringify(submissionsR.data || [])

    );


    
  this.write(
    KEYS.LESSONS,
    JSON.stringify(lessonsR.data || [])
  
);

    this.write(

      KEYS.NOTIFICATIONS,

      JSON.stringify(notificationsR.data || [])

    );

  }

  public async refreshFromSupabase(): Promise<void> {

    await this.hydrateFromSupabase();

  }

  /* =========================================================

     AUTH

  ========================================================= */

  public getCurrentUser(): Profile | null {

    const raw = this.read(KEYS.CURRENT_USER);

    if (!raw) return null;

    try {

      return JSON.parse(raw);

    } catch {

      return null;

    }

  }

  public setCurrentUser(user: Profile | null): void {

    if (!user) {

      this.remove(KEYS.CURRENT_USER);

      return;

    }

    this.write(KEYS.CURRENT_USER, JSON.stringify(user));

  }

  public isAdminSessionValid(): boolean {

    try {

      const raw = this.read(KEYS.ADMIN_SESSION);

      if (!raw) return false;

      const session = JSON.parse(raw);

      return Boolean(

        session &&

        session.adminId &&

        session.authenticated === true

      );

    } catch {

      return false;

    }

  }

  public invalidateAdminSession(): void {

    this.remove(KEYS.ADMIN_SESSION);

  }

  public async restoreSession(): Promise<Profile | null> {

    const client = this.requireSupabase();

    const { data, error } = await client.auth.getSession();

    if (error) throw error;

    if (!data.session?.user) {

      this.setCurrentUser(null);

      this.invalidateAdminSession();

      return null;

    }

    await this.hydrateFromSupabase();

    const profile =

      this.getAllProfilesInternal().find(

        p => p.id === data.session!.user.id

      ) || null;

    this.setCurrentUser(profile);

    if (profile?.role === 'admin') {

      this.write(

        KEYS.ADMIN_SESSION,

        JSON.stringify({

          adminId: profile.id,

          authenticated: true,

          loginAt: new Date().toISOString()

        })

      );

    }

    return profile;

  }

  public async login(

    email: string,

    password?: string

  ): Promise<Profile> {

    const client = this.requireSupabase();

    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedEmail || !password) {

      throw new Error('Email and password are required.');

    }

    const { data, error } =

      await client.auth.signInWithPassword({

        email: trimmedEmail,

        password

      });

    if (error || !data.user) {

      throw new Error(error?.message || 'Unable to sign in.');

    }

    await this.hydrateFromSupabase();

    const profile = this.getAllProfilesInternal().find(

      p => p.id === data.user!.id

    );

    if (!profile) {

      await client.auth.signOut();

      throw new Error('Account profile was not found.');

    }

    if (profile.role === 'admin') {

      this.write(

        KEYS.ADMIN_SESSION,

        JSON.stringify({

          adminId: profile.id,

          authenticated: true,

          loginAt: new Date().toISOString()

        })

      );

    } else {

      this.invalidateAdminSession();

    }

    this.setCurrentUser(profile);

    return profile;

  }

  public async register(

    fullName: string,

    email: string,

    studentId: string,

    password?: string,

    gradeLevel?: string

  ): Promise<Profile> {

    const client = this.requireSupabase();

    const trimmedName = (fullName || '').trim();

    const trimmedEmail = (email || '').trim().toLowerCase();

    const trimmedId = (studentId || '').trim();

    const chosenGrade =

      (gradeLevel || '').trim() || 'Grade 9';

    if (trimmedName.length < 2) {

      throw new Error('Please provide your full name.');

    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {

      throw new Error('Please provide a valid email address.');

    }

    if (trimmedId.length < 3) {

      throw new Error('Please enter a valid Student ID.');

    }

    if (!password || password.length < 6) {

      throw new Error(

        'Password must be at least 6 characters long.'

      );

    }

    const { data, error } = await client.auth.signUp({

      email: trimmedEmail,

      password,

      options: {

        data: {

          full_name: trimmedName,

          student_id: trimmedId,

          role: 'student',

          grade_level: chosenGrade

        }

      }

    });

    if (error || !data.user) {

      throw new Error(

        error?.message || 'Unable to create account.'

      );

    }

    if (!data.session) {

      throw new Error(

        'Account created. Please confirm your email, then sign in.'

      );

    }

    await this.hydrateFromSupabase();

    const profile = this.getAllProfilesInternal().find(

      p => p.id === data.user!.id

    );

    if (!profile) {

      throw new Error(

        'Account created, but profile setup is still pending. Please sign in again.'

      );

    }

    this.invalidateAdminSession();

    this.setCurrentUser(profile);

    await this.createNotification(

      profile.id,

      'Welcome to Mindcraft Academy! 🚀',

      'Your student account is active. Explore your exams, assignments, and learning tracks.',

      'success'

    );

    return profile;

  }

  public async logout(): Promise<void> {

    const client = this.requireSupabase();

    await client.auth.signOut();

    this.setCurrentUser(null);

    this.invalidateAdminSession();

    this.initDatabase();

  }

  /* =========================================================

     PROFILES

  ========================================================= */

  public getAllProfilesInternal(): Profile[] {

    try {

      const raw = this.read(KEYS.PROFILES);

      return raw ? JSON.parse(raw) : [];

    } catch {

      return [];

    }

  }

  public getProfiles(forceAdminAccess = false): Profile[] {

    const currentUser = this.getCurrentUser();

    const profiles = this.getAllProfilesInternal();

    if (

      forceAdminAccess ||

      (currentUser &&

        currentUser.role === 'admin' &&

        this.isAdminSessionValid())

    ) {

      return profiles;

    }

    if (currentUser?.role === 'student') {

      return profiles.filter(p => p.id === currentUser.id);

    }

    return [];

  }

  public getProfile(id: string): Profile | undefined {

    const currentUser = this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      currentUser.id !== id

    ) {

      return undefined;

    }

    return this.getAllProfilesInternal().find(

      profile => profile.id === id

    );

  }

  public async updateProfile(

    id: string,

    updates: Partial<Profile>

  ): Promise<Profile> {

    const client = this.requireSupabase();

    const currentUser = this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      currentUser.id !== id

    ) {

      throw new Error(

        'Unauthorized: You can only update your own profile.'

      );

    }

    const payload: any = { ...updates };

    delete payload.id;

    delete payload.created_at;

    if (currentUser?.role === 'student') {

      delete payload.role;

    }

    payload.updated_at = new Date().toISOString();

    const { data, error } = await client

      .from('profiles')

      .update(payload)

      .eq('id', id)

      .select()

      .single();

    if (error) throw error;

    const profiles = this.getAllProfilesInternal();

    const index = profiles.findIndex(p => p.id === id);

    if (index >= 0) {

      profiles[index] = data as Profile;

    } else {

      profiles.push(data as Profile);

    }

    this.write(KEYS.PROFILES, JSON.stringify(profiles));

    if (currentUser?.id === id) {

      this.setCurrentUser(data as Profile);

    }

    return data as Profile;

  }

  /* =========================================================

     EXAMS

  ========================================================= */

  public getExams(

    role?: UserRole,

    gradeLevel?: string

  ): Exam[] {

    const raw = this.read(KEYS.EXAMS);

    const exams: Exam[] = raw ? JSON.parse(raw) : [];

    const questions = this.getAllQuestions();

    const enriched = exams.map(exam => ({

      ...exam,

      question_count: questions.filter(

        question => question.exam_id === exam.id

      ).length

    }));

    if (role === 'student') {

      let filtered = enriched.filter(

        exam => exam.status === 'published'

      );

      if (gradeLevel) {

        filtered = filtered.filter(

          exam =>

            !exam.target_grade ||

            exam.target_grade === 'All Grades' ||

            exam.target_grade.toLowerCase() ===

              gradeLevel.toLowerCase()

        );

      }

      return filtered;

    }

    return enriched;

  }

  public getExam(id: string): Exam | undefined {

    const exam = this.getExams().find(

      item => item.id === id

    );

    if (!exam) return undefined;

    const questions = this.getQuestionsForExam(id);

    return {

      ...exam,

      questions,

      question_count: questions.length

    };

  }

  public async saveExam(
  exam: Partial<Exam>
): Promise<Exam> {
  const client = this.requireSupabase();

  console.log('SAVE EXAM RECEIVED:', exam);

  const existingExam = exam.id
    ? this.getExam(exam.id)
    : undefined;

  const title =
    exam.title !== undefined
      ? exam.title.trim()
      : existingExam?.title?.trim() || '';

  if (!title) {
    console.error(
      'Exam title is missing. Received:',
      exam
    );

    throw new Error(
      'Exam title is required.'
    );
  }

  const durationMinutes =
    exam.duration_minutes !== undefined
      ? Number(exam.duration_minutes)
      : Number(existingExam?.duration_minutes ?? 30);

  const totalMarks =
    exam.total_marks !== undefined
      ? Number(exam.total_marks)
      : Number(existingExam?.total_marks ?? 100);

  const payload: any = {
    title,

    description:
      exam.description !== undefined
        ? exam.description.trim()
        : existingExam?.description || '',

    duration_minutes:
      Number.isFinite(durationMinutes) &&
      durationMinutes > 0
        ? durationMinutes
        : 30,

    total_marks:
      Number.isFinite(totalMarks) &&
      totalMarks >= 0
        ? totalMarks
        : 100,

    target_grade:
      exam.target_grade !== undefined
        ? exam.target_grade
        : existingExam?.target_grade ||
          'All Grades',

    status:
      exam.status !== undefined
        ? exam.status
        : existingExam?.status || 'draft',

    updated_at: new Date().toISOString()
  };

  console.log(
    'SAVE EXAM PAYLOAD:',
    payload
  );

  let data: any;
  let error: any;

  if (exam.id) {
    ({ data, error } = await client
      .from('exams')
      .update(payload)
      .eq('id', exam.id)
      .select()
      .single());
  } else {
    const { data: authData } =
      await client.auth.getUser();

    if (!authData.user) {
      throw new Error(
        'You must be logged in to create an exam.'
      );
    }

    payload.created_by =
      exam.created_by ||
      authData.user.id;

    console.log(
      'CREATING EXAM IN SUPABASE:',
      payload
    );

    ({ data, error } = await client
      .from('exams')
      .insert(payload)
      .select()
      .single());
  }

  if (error) {
    console.error(
      'SAVE EXAM SUPABASE ERROR:',
      error
    );

    throw error;
  }

  if (!data) {
    throw new Error(
      'Supabase did not return the saved exam.'
    );
  }

  console.log(
    'EXAM SAVED SUCCESSFULLY:',
    data
  );

  const exams = this.getExams().map(
    ({
      questions,
      question_count,
      ...item
    }) => item
  );

  const index = exams.findIndex(
    item => item.id === data.id
  );

  if (index >= 0) {
    exams[index] = data as Exam;
  } else {
    exams.unshift(data as Exam);
  }

  this.write(
    KEYS.EXAMS,
    JSON.stringify(exams)
  );

  return data as Exam;
}

  public createExam(

    examData: Partial<Exam>

  ): Promise<Exam> {

    return this.saveExam(examData);

  }

  public updateExam(

    id: string,

    updates: Partial<Exam>

  ): Promise<Exam> {

    return this.saveExam({

      id,

      ...updates

    });

  }

  public async deleteExam(

    id: string

  ): Promise<boolean> {

    const client = this.requireSupabase();

    /*

      FK cascades should remove:

      questions -> options

      exam_attempts -> answers

      when your schema uses ON DELETE CASCADE.

    */

    const { error } = await client

      .from('exams')

      .delete()

      .eq('id', id);

    if (error) throw error;

    const exams = this.getExams()

      .filter(exam => exam.id !== id)

      .map(

        ({ questions, question_count, ...exam }) =>

          exam

      );

    const questions = this.getAllQuestions().filter(

      question => question.exam_id !== id

    );

    const attempts = this.getAttemptsRaw().filter(

      attempt => attempt.exam_id !== id

    );

    this.write(KEYS.EXAMS, JSON.stringify(exams));

    this.write(

      KEYS.QUESTIONS,

      JSON.stringify(questions)

    );

    this.write(

      KEYS.ATTEMPTS,

      JSON.stringify(attempts)

    );

    return true;

  }

  public async duplicateExam(

    id: string

  ): Promise<Exam> {

    const original = this.getExam(id);

    if (!original) {

      throw new Error('Original exam not found');

    }

    const newExam = await this.saveExam({

      title: `${original.title} (Copy)`,

      description: original.description,

      duration_minutes: original.duration_minutes,

      total_marks: original.total_marks,

      target_grade: original.target_grade,

      status: 'draft'

    });

    for (

      let index = 0;

      index < (original.questions || []).length;

      index++

    ) {

      const question = original.questions![index];

      await this.saveQuestion({

        exam_id: newExam.id,

        type: question.type,

        question_text: question.question_text,

        marks: question.marks,

        order_index: index + 1,

        options: question.options?.map(option => ({

          ...option,

          id: undefined,

          question_id: undefined

        })) as unknown as QuestionOption[]

      });

    }

    return this.getExam(newExam.id) || newExam;

  }

  /* =========================================================

     QUESTIONS

  ========================================================= */

  public getAllQuestions(): Question[] {

    const raw = this.read(KEYS.QUESTIONS);

    return raw ? JSON.parse(raw) : [];

  }

  public getQuestionsForExam(

    examId: string

  ): Question[] {

    return this.getAllQuestions()

      .filter(

        question => question.exam_id === examId

      )

      .sort(

        (a, b) =>

          Number(a.order_index) -

          Number(b.order_index)

      );

  }

  public async saveQuestion(

    questionData: Partial<Question>

  ): Promise<Question> {

    const client = this.requireSupabase();

    if (!questionData.exam_id) {

      throw new Error('exam_id is required.');

    }

    let question: any;

    if (questionData.id) {

      const { data, error } = await client

        .from('questions')

        .update({

          type:

            questionData.type ||

            'multiple_choice',

          question_text:

            questionData.question_text || '',

          marks:

            Number(questionData.marks) || 5,

          order_index:

            Number(questionData.order_index) || 1

        })

        .eq('id', questionData.id)

        .select()

        .single();

      if (error) throw error;

      question = data;

      /*

       * Options are replaced as one unit.

       * This avoids stale options remaining after editing.

       */

      const { error: deleteOptionsError } =

        await client

          .from('question_options')

          .delete()

          .eq('question_id', question.id);

      if (deleteOptionsError) {

        throw deleteOptionsError;

      }

    } else {

      let orderIndex =

        Number(questionData.order_index) || 0;

      if (!orderIndex) {

        const { count, error: countError } =

          await client

            .from('questions')

            .select('*', {

              count: 'exact',

              head: true

            })

            .eq(

              'exam_id',

              questionData.exam_id

            );

        if (countError) throw countError;

        orderIndex = (count || 0) + 1;

      }

      const { data, error } = await client

        .from('questions')

        .insert({

          exam_id: questionData.exam_id,

          type:

            questionData.type ||

            'multiple_choice',

          question_text:

            questionData.question_text || '',

          marks:

            Number(questionData.marks) || 5,

          order_index: orderIndex

        })

        .select()

        .single();

      if (error) throw error;

      question = data;

    }

    const incomingOptions =

      questionData.options || [];

    let savedOptions: QuestionOption[] = [];

    if (incomingOptions.length > 0) {

      const optionRows = incomingOptions.map(

        (option: any, index: number) => ({

          question_id: question.id,

          option_text:

            option.option_text ??

            option.text ??

            '',

          is_correct:

            option.is_correct ??

            option.isCorrect ??

            false,

          order_index:

            Number(option.order_index) ||

            index + 1

        })

      );

      const { data, error } = await client

        .from('question_options')

        .insert(optionRows)

        .select();

      if (error) throw error;

      savedOptions =

        (data || []) as QuestionOption[];

    }

    const savedQuestion: Question = {

      ...question,

      options: savedOptions

    };

    const questions = this.getAllQuestions();

    const index = questions.findIndex(

      item => item.id === savedQuestion.id

    );

    if (index >= 0) {

      questions[index] = savedQuestion;

    } else {

      questions.push(savedQuestion);

    }

    this.write(

      KEYS.QUESTIONS,

      JSON.stringify(questions)

    );

    await this.recalculateExamTotalMarks(

      questionData.exam_id

    );

    return savedQuestion;

  }

  public async deleteQuestion(

    id: string

  ): Promise<boolean> {

    const client = this.requireSupabase();

    const questions = this.getAllQuestions();

    const target = questions.find(

      question => question.id === id

    );

    if (!target) return false;

    const { error } = await client

      .from('questions')

      .delete()

      .eq('id', id);

    if (error) throw error;

    const remaining = questions.filter(

      question => question.id !== id

    );

    this.write(

      KEYS.QUESTIONS,

      JSON.stringify(remaining)

    );

    await this.recalculateExamTotalMarks(

      target.exam_id

    );

    return true;

  }

  public async reorderQuestions(

    examId: string,

    orderedIds: string[]

  ): Promise<void> {

    const client = this.requireSupabase();

    for (

      let index = 0;

      index < orderedIds.length;

      index++

    ) {

      const { error } = await client

        .from('questions')

        .update({

          order_index: index + 1

        })

        .eq('id', orderedIds[index])

        .eq('exam_id', examId);

      if (error) throw error;

    }

    const questions = this.getAllQuestions().map(

      question => {

        if (question.exam_id !== examId) {

          return question;

        }

        const index = orderedIds.indexOf(

          question.id

        );

        return index >= 0

          ? {

              ...question,

              order_index: index + 1

            }

          : question;

      }

    );

    this.write(

      KEYS.QUESTIONS,

      JSON.stringify(questions)

    );

  }

  private async recalculateExamTotalMarks(

    examId: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const questions =

      this.getQuestionsForExam(examId);

    const total = questions.reduce(

      (sum, question) =>

        sum + (Number(question.marks) || 0),

      0

    );

    const { data, error } = await client

      .from('exams')

      .update({

        total_marks: total

      })

      .eq('id', examId)

      .select()

      .single();

    if (error) throw error;

    const exams = this.getExams().map(

      ({ questions, question_count, ...exam }) =>

        exam

    );

    const index = exams.findIndex(

      exam => exam.id === examId

    );

    if (index >= 0) {

      exams[index] = data as Exam;

      this.write(

        KEYS.EXAMS,

        JSON.stringify(exams)

      );

    }

  }

  /* =========================================================

     EXAM ATTEMPTS

  ========================================================= */

  private getAttemptsRaw(): ExamAttempt[] {

    const raw = this.read(KEYS.ATTEMPTS);

    return raw ? JSON.parse(raw) : [];

  }

  public getAttempts(): ExamAttempt[] {

    const allAttempts = this.getAttemptsRaw();

    const exams = this.getExams();

    const profiles =

      this.getAllProfilesInternal();

    const currentUser = this.getCurrentUser();

    let filtered = allAttempts;

    if (currentUser?.role === 'student') {

      filtered = allAttempts.filter(

        attempt =>

          attempt.student_id === currentUser.id

      );

    }

    return filtered.map(attempt => ({

      ...attempt,

      exam: exams.find(

        exam => exam.id === attempt.exam_id

      ),

      student: profiles.find(

        profile =>

          profile.id === attempt.student_id

      )

    }));

  }

  public getAttempt(

    id: string

  ): ExamAttempt | undefined {

    const attempt = this.getAttempts().find(

      item => item.id === id

    );

    if (!attempt) return undefined;

    const currentUser = this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      attempt.student_id !== currentUser.id

    ) {

      return undefined;

    }

    return attempt;

  }

  public getStudentAttempts(

    studentId: string

  ): ExamAttempt[] {

    const currentUser = this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      currentUser.id !== studentId

    ) {

      return [];

    }

    return this.getAttempts().filter(

      attempt =>

        attempt.student_id === studentId

    );

  }

  public async refreshAttempt(
  attemptId: string
): Promise<ExamAttempt> {

  const client = this.requireSupabase();

  // Get the latest attempt directly from Supabase
  const {
    data: attemptRow,
    error: attemptError
  } = await client
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attemptRow) {
    console.error(
      'Failed to refresh exam attempt:',
      attemptError
    );

    throw (
      attemptError ||
      new Error('Exam attempt not found.')
    );
  }

  // Get the latest answers directly from Supabase
  const {
    data: answerRows,
    error: answersError
  } = await client
    .from('answers')
    .select('*')
    .eq('attempt_id', attemptId);

  if (answersError) {
    console.error(
      'Failed to refresh attempt answers:',
      answersError
    );

    throw answersError;
  }

  // Attach fresh answers to the attempt
  const refreshedAttempt: ExamAttempt = {
    ...(attemptRow as ExamAttempt),
    answers: (answerRows || []) as Answer[]
  };

  // Update runtime cache
  const attempts = this.getAttemptsRaw();

  const index = attempts.findIndex(
    attempt => attempt.id === attemptId
  );

  if (index >= 0) {
    attempts[index] = refreshedAttempt;
  } else {
    attempts.unshift(refreshedAttempt);
  }

  this.write(
    KEYS.ATTEMPTS,
    JSON.stringify(attempts)
  );

  return refreshedAttempt;
}
  public async startExamAttempt(

    examId: string,

    studentId: string

  ): Promise<ExamAttempt> {

    const client = this.requireSupabase();

    const existing = this.getAttemptsRaw().find(

      attempt =>

        attempt.exam_id === examId &&

        attempt.student_id === studentId &&

        attempt.status === 'in_progress'

    );

    if (existing) return existing;

    const { data, error } = await client

      .from('exam_attempts')

      .insert({

        exam_id: examId,

        student_id: studentId,

        started_at: new Date().toISOString(),

        submitted_at: null,

        status: 'in_progress',

        auto_score: 0,

        manual_score: 0,

        final_score: 0

      })

      .select()

      .single();

    if (error) throw error;

    const newAttempt: ExamAttempt = {

      ...(data as ExamAttempt),

      answers: []

    };

    const attempts = this.getAttemptsRaw();

    attempts.unshift(newAttempt);

    this.write(

      KEYS.ATTEMPTS,

      JSON.stringify(attempts)

    );

    return newAttempt;

  }

  public async saveAnswer(
    attemptId: string,
    answerData: Partial<Answer>
  ): Promise<Answer> {
    const client = this.requireSupabase();

    if (!answerData.question_id) {
      throw new Error(
        'question_id is required.'
      );
    }

    const {
      data: attemptRow,
      error: attemptError
    } = await client
      .from('exam_attempts')
      .select('id')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attemptRow) {
      console.error(
        'Exam attempt lookup failed:',
        attemptError
      );

      throw new Error(
        'Exam attempt not found in database.'
      );
    }

    const payload = {
      attempt_id: attemptId,
      question_id: answerData.question_id,
      selected_option_id:
        answerData.selected_option_id ?? null,
      answer_text:
        answerData.answer_text ?? null,
      uploaded_file_path:
        answerData.uploaded_file_path ?? null,
      uploaded_file_name:
        answerData.uploaded_file_name ?? null
    };

    const {
      data: existingAnswer,
      error: existingError
    } = await client
      .from('answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .eq(
        'question_id',
        answerData.question_id
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        'Failed checking existing answer:',
        existingError
      );
      throw existingError;
    }

    let savedAnswer: Answer;

    if (existingAnswer) {
      const { data, error } = await client
        .from('answers')
        .update(payload)
        .eq('id', existingAnswer.id)
        .select()
        .single();

      if (error) {
        console.error(
          'Answer update failed:',
          error
        );
        throw error;
      }

      savedAnswer = data as Answer;
    } else {
      const { data, error } = await client
        .from('answers')
        .insert({
          ...payload,
          auto_score: 0,
          manual_score: 0,
          feedback: null
        })
        .select()
        .single();

      if (error) {
        console.error(
          'Answer insert failed:',
          error
        );
        throw error;
      }

      savedAnswer = data as Answer;
    }

    const attempts = this.getAttemptsRaw();
    const attemptIndex = attempts.findIndex(
      attempt => attempt.id === attemptId
    );

    if (attemptIndex >= 0) {
      if (!attempts[attemptIndex].answers) {
        attempts[attemptIndex].answers = [];
      }

      const answerIndex =
        attempts[attemptIndex].answers!.findIndex(
          answer =>
            answer.question_id ===
            answerData.question_id
        );

      if (answerIndex >= 0) {
        attempts[attemptIndex].answers![answerIndex] =
          savedAnswer;
      } else {
        attempts[attemptIndex].answers!.push(
          savedAnswer
        );
      }

      this.write(
        KEYS.ATTEMPTS,
        JSON.stringify(attempts)
      );
    }

    return savedAnswer;
  }

  public async submitExamAttempt(
  attemptId: string
): Promise<ExamAttempt> {
  const client = this.requireSupabase();

  // 1. Get the attempt directly from Supabase
  const {
    data: attemptRow,
    error: attemptError
  } = await client
    .from('exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attemptRow) {
    console.error(
      'Failed to load exam attempt:',
      attemptError
    );

    throw new Error(
      'Exam attempt not found.'
    );
  }

  // 2. Get all saved answers directly from Supabase
  const {
    data: databaseAnswers,
    error: answersError
  } = await client
    .from('answers')
    .select('*')
    .eq('attempt_id', attemptId);

  if (answersError) {
    console.error(
      'Failed to load answers:',
      answersError
    );

    throw answersError;
  }

  // 3. Get the exam questions directly from Supabase
  const {
    data: databaseQuestions,
    error: questionsError
  } = await client
    .from('questions')
    .select('*')
    .eq('exam_id', attemptRow.exam_id);

  if (questionsError) {
    console.error(
      'Failed to load questions:',
      questionsError
    );

    throw questionsError;
  }

  // 4. Get the question options directly from Supabase
  const questionIds = (databaseQuestions || [])
    .map(question => question.id);

  let databaseOptions: any[] = [];

  if (questionIds.length > 0) {
    const {
      data,
      error
    } = await client
      .from('question_options')
      .select('*')
      .in('question_id', questionIds);

    if (error) {
      console.error(
        'Failed to load question options:',
        error
      );

      throw error;
    }

    databaseOptions = data || [];
  }

  let calculatedAutoScore = 0;
  let hasEssay = false;

  const updatedAnswers: Answer[] = [];

  // 5. Grade every saved answer
  for (const answer of databaseAnswers || []) {
    const question = (
      databaseQuestions || []
    ).find(
      item =>
        item.id === answer.question_id
    );

    if (!question) {
      updatedAnswers.push(
        answer as Answer
      );

      continue;
    }

    if (
      question.type === 'multiple_choice' ||
      question.type === 'true_false'
    ) {
      const selectedOption =
        databaseOptions.find(
          option =>
            option.id ===
            answer.selected_option_id
        );

      const isCorrect =
        selectedOption?.is_correct === true;

      const score = isCorrect
        ? Number(question.marks) || 0
        : 0;

      calculatedAutoScore += score;

      console.log('AUTO GRADING:', {
        questionId: question.id,
        selectedOptionId:
          answer.selected_option_id,
        selectedOption,
        isCorrect,
        marks: question.marks,
        score
      });

      const {
        data: updatedAnswer,
        error: updateAnswerError
      } = await client
        .from('answers')
        .update({
          auto_score: score
        })
        .eq('id', answer.id)
        .select()
        .single();

      if (updateAnswerError) {
        console.error(
          'Failed to update answer score:',
          updateAnswerError
        );

        throw updateAnswerError;
      }

      updatedAnswers.push(
        updatedAnswer as Answer
      );
    } else {
      if (question.type === 'essay') {
        hasEssay = true;
      }

      updatedAnswers.push(
        answer as Answer
      );
    }
  }

  // 6. Determine attempt status
  const status = hasEssay
    ? 'submitted'
    : 'graded';

  // 7. Save calculated score
  const {
    data: updatedAttemptRow,
    error: submitError
  } = await client
    .from('exam_attempts')
    .update({
      submitted_at:
        new Date().toISOString(),

      auto_score:
        calculatedAutoScore,

      final_score:
        calculatedAutoScore,

      status
    })
    .eq('id', attemptId)
    .select()
    .single();

  if (submitError) {
    console.error(
      'Exam submission failed:',
      submitError
    );

    throw submitError;
  }

  const updatedAttempt: ExamAttempt = {
    ...(updatedAttemptRow as ExamAttempt),
    answers: updatedAnswers
  };

  // 8. Synchronize runtime cache
  const attempts =
    this.getAttemptsRaw();

  const cacheIndex =
    attempts.findIndex(
      attempt =>
        attempt.id === attemptId
    );

  if (cacheIndex >= 0) {
    attempts[cacheIndex] =
      updatedAttempt;
  } else {
    attempts.unshift(
      updatedAttempt
    );
  }

  this.write(
    KEYS.ATTEMPTS,
    JSON.stringify(attempts)
  );

  // 9. Admin notification
  const exam =
    this.getExam(
      attemptRow.exam_id
    );

  const student =
    this.getAllProfilesInternal().find(
      profile =>
        profile.id ===
        attemptRow.student_id
    );

  await this.notifyAdmins(
    'New Exam Submission',

    `${
      student?.full_name ||
      'A student'
    } submitted "${
      exam?.title ||
      'Exam'
    }". ${
      hasEssay
        ? 'Essay requires manual review.'
        : 'All questions graded.'
    }`,

    'alert'
  );

  return updatedAttempt;
}

  public async gradeExamAttempt(

    attemptId: string,

    essayGrades: {

      questionId: string;

      manual_score: number;

      feedback: string;

    }[]

  ): Promise<ExamAttempt> {

    const client = this.requireSupabase();

    const attempts = this.getAttemptsRaw();

    const index = attempts.findIndex(

      attempt => attempt.id === attemptId

    );

    if (index < 0) {

      throw new Error('Attempt not found');

    }

    const attempt = attempts[index];

    let totalManualScore = 0;

    for (const gradeInfo of essayGrades) {

      const answer = attempt.answers?.find(

        item =>

          item.question_id ===

          gradeInfo.questionId

      );

      if (!answer) continue;

      const score =

        Number(gradeInfo.manual_score) || 0;

      totalManualScore += score;

      const { data, error } = await client

        .from('answers')

        .update({

          manual_score: score,

          feedback:

            gradeInfo.feedback || ''

        })

        .eq('id', answer.id)

        .select()

        .single();

      if (error) throw error;

      Object.assign(answer, data);

    }

    const finalScore =

      (Number(attempt.auto_score) || 0) +

      totalManualScore;

    const { data, error } = await client

      .from('exam_attempts')

      .update({

        manual_score: totalManualScore,

        final_score: finalScore,

        status: 'graded'

      })

      .eq('id', attemptId)

      .select()

      .single();

    if (error) throw error;

    const updatedAttempt: ExamAttempt = {

      ...(data as ExamAttempt),

      answers: attempt.answers || []

    };

    attempts[index] = updatedAttempt;

    this.write(

      KEYS.ATTEMPTS,

      JSON.stringify(attempts)

    );

    const exam = this.getExam(

      attempt.exam_id

    );

    const totalMarks =

      Number(exam?.total_marks) || 100;

    const percentage = Math.round(

      (finalScore / totalMarks) * 100

    );

    await this.createNotification(

      attempt.student_id,

      `Exam Graded: ${exam?.title || 'Exam'}`,

      `Your exam has been graded. Final Score: ${finalScore}/${totalMarks} (${percentage}%). Teacher feedback has been provided.`,

      'success'

    );

    return updatedAttempt;

  }

  public async gradeEssayAnswer(

    attemptId: string,

    questionId: string,

    manualScore: number,

    feedback: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const attempts = this.getAttemptsRaw();

    const attempt = attempts.find(

      item => item.id === attemptId

    );

    const answer = attempt?.answers?.find(

      item => item.question_id === questionId

    );

    if (!attempt || !answer) return;

    const { data, error } = await client

      .from('answers')

      .update({

        manual_score:

          Number(manualScore) || 0,

        feedback: feedback || ''

      })

      .eq('id', answer.id)

      .select()

      .single();

    if (error) throw error;

    Object.assign(answer, data);

    this.write(

      KEYS.ATTEMPTS,

      JSON.stringify(attempts)

    );

  }

  public async finalizeExamAttempt(

    attemptId: string

  ): Promise<ExamAttempt> {

    const client = this.requireSupabase();

    const attempts = this.getAttemptsRaw();

    const index = attempts.findIndex(

      attempt => attempt.id === attemptId

    );

    if (index < 0) {

      throw new Error('Attempt not found');

    }

    const attempt = attempts[index];

    const totalManual = (

      attempt.answers || []

    ).reduce(

      (sum, answer) =>

        sum +

        (Number(answer.manual_score) || 0),

      0

    );

    const finalScore =

      (Number(attempt.auto_score) || 0) +

      totalManual;

    const { data, error } = await client

      .from('exam_attempts')

      .update({

        manual_score: totalManual,

        final_score: finalScore,

        status: 'graded'

      })

      .eq('id', attemptId)

      .select()

      .single();

    if (error) throw error;

    const updated: ExamAttempt = {

      ...(data as ExamAttempt),

      answers: attempt.answers || []

    };

    attempts[index] = updated;

    this.write(

      KEYS.ATTEMPTS,

      JSON.stringify(attempts)

    );

    const exam = this.getExam(

      attempt.exam_id

    );

    const totalMarks =

      Number(exam?.total_marks) || 100;

    const percentage = Math.round(

      (finalScore / totalMarks) * 100

    );

    await this.createNotification(

      attempt.student_id,

      `Exam Graded: ${exam?.title || 'Exam'}`,

      `Your exam results are ready. Final Score: ${finalScore}/${totalMarks} (${percentage}%). Verified by teacher.`,

      'success'

    );

    return updated;

  }

  /* =========================================================

     ASSIGNMENTS

  ========================================================= */

  public getAssignments(

    role?: UserRole,

    gradeLevel?: string

  ): Assignment[] {

    const raw = this.read(KEYS.ASSIGNMENTS);

    const assignments: Assignment[] =

      raw ? JSON.parse(raw) : [];

    if (role === 'student') {

      let filtered = assignments.filter(

        assignment =>

          assignment.status === 'published'

      );

      if (gradeLevel) {

        filtered = filtered.filter(

          assignment =>

            !assignment.target_grade ||

            assignment.target_grade ===

              'All Grades' ||

            assignment.target_grade.toLowerCase() ===

              gradeLevel.toLowerCase()

        );

      }

      return filtered;

    }

    return assignments;

  }

  public getAssignment(

    id: string

  ): Assignment | undefined {

    return this.getAssignments().find(

      assignment => assignment.id === id

    );

  }

  public async saveAssignment(

    assignmentData: Partial<Assignment>

  ): Promise<Assignment> {

    const client = this.requireSupabase();

    const existing = assignmentData.id

      ? this.getAssignment(assignmentData.id)

      : undefined;

    const payload: any = {

      title:

        assignmentData.title?.trim() ||

        existing?.title ||

        'New Assignment',

      description:

        assignmentData.description !== undefined

          ? assignmentData.description.trim()

          : existing?.description || '',

      file_path:

        assignmentData.file_path !== undefined

          ? assignmentData.file_path

          : existing?.file_path || null,

      file_name:

        assignmentData.file_name !== undefined

          ? assignmentData.file_name

          : existing?.file_name || null,

      due_date:

        assignmentData.due_date ||

        existing?.due_date ||

        new Date(

          Date.now() + 7 * 86400000

        ).toISOString(),

      max_grade:

        Number(

          assignmentData.max_grade ??

            existing?.max_grade

        ) || 100,

      target_grade:

        assignmentData.target_grade ??

        existing?.target_grade ??

        'All Grades',

      status:

        assignmentData.status ??

        existing?.status ??

        'published',

      updated_at: new Date().toISOString()

    };

    let data: any;

    let error: any;

    if (assignmentData.id) {

      ({ data, error } = await client

        .from('assignments')

        .update(payload)

        .eq('id', assignmentData.id)

        .select()

        .single());

    } else {

      const { data: authData } =

        await client.auth.getUser();

      payload.created_by =

        assignmentData.created_by ||

        authData.user?.id ||

        null;

      ({ data, error } = await client

        .from('assignments')

        .insert(payload)

        .select()

        .single());

    }

    if (error) throw error;

    const assignments =

      this.getAssignments();

    const index = assignments.findIndex(

      assignment =>

        assignment.id === data.id

    );

    if (index >= 0) {

      assignments[index] =

        data as Assignment;

    } else {

      assignments.unshift(

        data as Assignment

      );

    }

    this.write(

      KEYS.ASSIGNMENTS,

      JSON.stringify(assignments)

    );

    if (

      !existing &&

      data.status === 'published'

    ) {

      await this.notifyAllStudents(

        'New Assignment Published',

        `"${data.title}" is now available. Max Score: ${data.max_grade} marks.`,

        'info'

      );

    }

    return data as Assignment;

  }

  public createAssignment(

    data: Partial<Assignment>

  ): Promise<Assignment> {

    return this.saveAssignment(data);

  }

  public updateAssignment(

    id: string,

    updates: Partial<Assignment>

  ): Promise<Assignment> {

    return this.saveAssignment({

      id,

      ...updates

    });

  }

  public async deleteAssignment(

    id: string

  ): Promise<boolean> {

    const client = this.requireSupabase();

    const assignment =

      this.getAssignment(id);

    const { error } = await client

      .from('assignments')

      .delete()

      .eq('id', id);

    if (error) throw error;

    const assignments =

      this.getAssignments().filter(

        item => item.id !== id

      );

    const submissions =

      this.getAssignmentSubmissionsRaw().filter(

        submission =>

          submission.assignment_id !== id

      );

    this.write(

      KEYS.ASSIGNMENTS,

      JSON.stringify(assignments)

    );

    this.write(

      KEYS.ASSIGNMENT_SUBMISSIONS,

      JSON.stringify(submissions)

    );

    /*

     * Database deletion does not automatically delete

     * the physical Storage object.

     */

    if (assignment?.file_path) {

      try {

        await this.deleteStoredFile(

          assignment.file_path

        );

      } catch (error) {

        console.warn(

          'Assignment deleted, but its Storage file could not be removed:',

          error

        );

      }

    }

    return true;

  }

 /* =========================================================
   LESSONS
========================================================= */

public getLessons(
  role?: UserRole,
  gradeLevel?: string
): Lesson[] {
  const raw = this.read(KEYS.LESSONS);

  const lessons: Lesson[] =
    raw ? JSON.parse(raw) : [];

  if (role === 'student') {
    let filtered = lessons.filter(
      lesson => lesson.is_published
    );

    if (gradeLevel) {
      filtered = filtered.filter(
        lesson =>
          lesson.target_grade?.toLowerCase() ===
          gradeLevel.toLowerCase()
      );
    }

    return filtered.sort(
      (a, b) =>
        (a.order_index || 0) -
        (b.order_index || 0)
    );
  }

  return lessons.sort(
    (a, b) =>
      (a.order_index || 0) -
      (b.order_index || 0)
  );
}

public getLesson(
  id: string
): Lesson | undefined {
  return this.getLessons().find(
    lesson => lesson.id === id
  );
}

public async createLesson(
  data: Partial<Lesson>
): Promise<Lesson> {
  const client = this.requireSupabase();

  const { data: authData } =
    await client.auth.getUser();

  const { data: lesson, error } =
    await client
      .from('lessons')
      .insert({
        title: data.title?.trim(),
        description:
          data.description?.trim() || null,
        target_grade:
          data.target_grade,
        file_path:
          data.file_path || null,
        file_name:
          data.file_name || null,
        video_url:
          data.video_url || null,
        order_index:
          data.order_index || 0,
        is_published:
          data.is_published ?? false,
        created_by:
          authData.user?.id || null
      })
      .select()
      .single();

  if (error) throw error;

  const lessons =
    this.getLessons();

  lessons.push(
    lesson as Lesson
  );

  this.write(
    KEYS.LESSONS,
    JSON.stringify(lessons)
  );

  return lesson as Lesson;
}

public async updateLesson(
  id: string,
  updates: Partial<Lesson>
): Promise<Lesson> {
  const client = this.requireSupabase();

  const payload: any = {
    ...updates,
    updated_at:
      new Date().toISOString()
  };

  delete payload.id;
  delete payload.created_at;

  const { data, error } =
    await client
      .from('lessons')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

  if (error) throw error;

  const lessons =
    this.getLessons();

  const index =
    lessons.findIndex(
      lesson => lesson.id === id
    );

  if (index >= 0) {
    lessons[index] =
      data as Lesson;
  }

  this.write(
    KEYS.LESSONS,
    JSON.stringify(lessons)
  );

  return data as Lesson;
}

public async deleteLesson(
  id: string
): Promise<boolean> {
  const client =
    this.requireSupabase();

  const { error } =
    await client
      .from('lessons')
      .delete()
      .eq('id', id);

  if (error) throw error;

  const lessons =
    this.getLessons().filter(
      lesson => lesson.id !== id
    );

  this.write(
    KEYS.LESSONS,
    JSON.stringify(lessons)
  );

  return true;
}
  /* =========================================================

     ASSIGNMENT SUBMISSIONS

  ========================================================= */

  private getAssignmentSubmissionsRaw():

    AssignmentSubmission[] {

    const raw = this.read(

      KEYS.ASSIGNMENT_SUBMISSIONS

    );

    return raw ? JSON.parse(raw) : [];

  }

  public getAssignmentSubmissions():

    AssignmentSubmission[] {

    const all =

      this.getAssignmentSubmissionsRaw();

    const assignments =

      this.getAssignments();

    const profiles =

      this.getAllProfilesInternal();

    const currentUser =

      this.getCurrentUser();

    let filtered = all;

    if (currentUser?.role === 'student') {

      filtered = all.filter(

        submission =>

          submission.student_id ===

          currentUser.id

      );

    }

    return filtered.map(submission => ({

      ...submission,

      assignment: assignments.find(

        assignment =>

          assignment.id ===

          submission.assignment_id

      ),

      student: profiles.find(

        profile =>

          profile.id ===

          submission.student_id

      )

    }));

  }

  public getAssignmentSubmission(

    id: string

  ): AssignmentSubmission | undefined {

    const submission =

      this.getAssignmentSubmissions().find(

        item => item.id === id

      );

    if (!submission) return undefined;

    const currentUser =

      this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      submission.student_id !==

        currentUser.id

    ) {

      return undefined;

    }

    return submission;

  }

  public getStudentAssignmentSubmissions(

    studentId: string

  ): AssignmentSubmission[] {

    const currentUser =

      this.getCurrentUser();

    if (

      currentUser?.role === 'student' &&

      currentUser.id !== studentId

    ) {

      return [];

    }

    return this.getAssignmentSubmissions().filter(

      submission =>

        submission.student_id === studentId

    );

  }

  public async submitAssignment(

    submissionData: {

      assignment_id: string;

      student_id: string;

      file_path: string;

      file_name: string;

      file_size?: number;

      file_type?: string;

    }

  ): Promise<AssignmentSubmission> {

    const client = this.requireSupabase();

    const assignment = this.getAssignment(

      submissionData.assignment_id

    );

    if (!assignment) {

      throw new Error(

        'Assignment not found.'

      );

    }

    const isLate =

      new Date() >

      new Date(assignment.due_date);

    /*

     * One current submission per student/assignment.

     * Delete the old database row before inserting

     * the replacement.

     */

    const existing =

      this.getAssignmentSubmissionsRaw().find(

        submission =>

          submission.assignment_id ===

            submissionData.assignment_id &&

          submission.student_id ===

            submissionData.student_id

      );

    if (existing) {

      const { error } = await client

        .from('assignment_submissions')

        .delete()

        .eq('id', existing.id);

      if (error) throw error;

    }

    const { data, error } = await client

      .from('assignment_submissions')

      .insert({

        assignment_id:

          submissionData.assignment_id,

        student_id:

          submissionData.student_id,

        file_path:

          submissionData.file_path,

        file_name:

          submissionData.file_name,

        file_size:

          submissionData.file_size || null,

        file_type:

          submissionData.file_type ||

          null,

        submitted_at:

          new Date().toISOString(),

        grade: null,

        feedback: null,

        status: isLate

          ? 'late'

          : 'submitted'

      })

      .select()

      .single();

    if (error) throw error;

    const submissions =

      this.getAssignmentSubmissionsRaw().filter(

        submission =>

          !(

            submission.assignment_id ===

              submissionData.assignment_id &&

            submission.student_id ===

              submissionData.student_id

          )

      );

    submissions.unshift(

      data as AssignmentSubmission

    );

    this.write(

      KEYS.ASSIGNMENT_SUBMISSIONS,

      JSON.stringify(submissions)

    );

    const student = this.getProfile(

      submissionData.student_id

    );

    await this.notifyAdmins(

      'New Assignment Submission',

      `${student?.full_name || 'A student'} submitted solution for "${assignment.title}".`,

      'info'

    );

    return data as AssignmentSubmission;

  }

  public async gradeAssignmentSubmission(

    submissionId: string,

    grade: number,

    feedback: string

  ): Promise<AssignmentSubmission> {

    const client = this.requireSupabase();

    const { data, error } = await client

      .from('assignment_submissions')

      .update({

        grade: Number(grade) || 0,

        feedback: feedback || '',

        status: 'graded'

      })

      .eq('id', submissionId)

      .select()

      .single();

    if (error) throw error;

    const submissions =

      this.getAssignmentSubmissionsRaw();

    const index = submissions.findIndex(

      submission =>

        submission.id === submissionId

    );

    if (index >= 0) {

      submissions[index] =

        data as AssignmentSubmission;

    }

    this.write(

      KEYS.ASSIGNMENT_SUBMISSIONS,

      JSON.stringify(submissions)

    );

    const assignment = this.getAssignment(

      data.assignment_id

    );

    await this.createNotification(

      data.student_id,

      `Assignment Graded: ${

        assignment?.title || 'Assignment'

      }`,

      `Your submission has been graded. Grade: ${

        data.grade

      }/${

        assignment?.max_grade || 100

      }. Feedback: "${data.feedback || ''}"`,

      'success'

    );

    return data as AssignmentSubmission;

  }

  /* =========================================================

     STORAGE

  ========================================================= */

  public getStoredFiles(): StoredFile[] {

    const raw = this.read(KEYS.FILES);

    return raw ? JSON.parse(raw) : [];

  }

  private splitStoragePath(filePath: string): {

    bucket:

      | 'assignment-files'

      | 'student-submissions'

      | 'exam-answers'

      | 'avatars';

    path: string;

  } {

    const buckets = [

      'assignment-files',

      'student-submissions',

      'exam-answers',

      'avatars'

    ] as const;

    for (const bucket of buckets) {

      if (

        filePath.startsWith(`${bucket}/`)

      ) {

        return {

          bucket,

          path: filePath.slice(

            bucket.length + 1

          )

        };

      }

    }

    return {

      bucket: 'assignment-files',

      path: filePath

    };

  }

  public async uploadFile(

    bucket:

      | 'assignment-files'

      | 'student-submissions'

      | 'exam-answers'

      | 'avatars',

    file: File,

    ownerId: string

  ): Promise<{

    path: string;

    file: StoredFile;

  }> {

    const client = this.requireSupabase();

    const safeName = file.name.replace(

      /[^a-zA-Z0-9._-]/g,

      '_'

    );

    const path =

      `${ownerId}/${Date.now()}-${safeName}`;

    const { error } = await client.storage

      .from(bucket)

      .upload(path, file, {

        upsert: false,

        contentType:

          file.type || undefined

      });

    if (error) throw error;

    const storedFile: StoredFile = {

      id: path,

      bucket,

      name: file.name,

      size: file.size,

      type:

        file.type ||

        'application/octet-stream',

      dataUrl: '',

      uploaded_at:

        new Date().toISOString(),

      owner_id: ownerId

    };

    /*

     * Metadata cache only.

     * File itself is already persisted in Supabase Storage.

     */

    const files = this.getStoredFiles();

    files.push(storedFile);

    this.write(

      KEYS.FILES,

      JSON.stringify(files)

    );

    return {

      path: `${bucket}/${path}`,

      file: storedFile

    };

  }

  public getFileByPath(

    filePath: string

  ): StoredFile | undefined {

    const files = this.getStoredFiles();

    const fileName =

      filePath.split('/').pop();

    return files.find(

      file =>

        file.name === fileName ||

        filePath.includes(file.name) ||

        file.id === filePath

    );

  }

  public async downloadFile(

    filePath: string,

    defaultName?: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const { bucket, path } =

      this.splitStoragePath(filePath);

    const { data, error } =

      await client.storage

        .from(bucket)

        .createSignedUrl(path, 60);

    if (error) throw error;

    if (!data?.signedUrl) {

      throw new Error(

        'Unable to create download URL.'

      );

    }

    const link =

      document.createElement('a');

    link.href = data.signedUrl;

    link.download =

      defaultName ||

      path.split('/').pop() ||

      'download';

    link.target = '_blank';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }

  public async deleteStoredFile(

    filePath: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const { bucket, path } =

      this.splitStoragePath(filePath);

    const { error } = await client.storage

      .from(bucket)

      .remove([path]);

    if (error) throw error;

    const files = this.getStoredFiles().filter(

      file =>

        file.id !== path &&

        file.id !== filePath

    );

    this.write(

      KEYS.FILES,

      JSON.stringify(files)

    );

  }

  /* =========================================================

     NOTIFICATIONS

  ========================================================= */

  public getNotifications(

    userId?: string

  ): Notification[] {

    const raw = this.read(

      KEYS.NOTIFICATIONS

    );

    const notifications: Notification[] =

      raw ? JSON.parse(raw) : [];

    const filtered = userId

      ? notifications.filter(

          notification =>

            notification.user_id === userId

        )

      : notifications;

    return filtered.sort(

      (a, b) =>

        new Date(b.created_at).getTime() -

        new Date(a.created_at).getTime()

    );

  }

  public async createNotification(

    userId: string,

    title: string,

    message: string,

    type:

      | 'info'

      | 'success'

      | 'warning'

      | 'alert' = 'info'

  ): Promise<Notification> {

    const client = this.requireSupabase();

    const { data, error } = await client

      .from('notifications')

      .insert({

        user_id: userId,

        title,

        message,

        type,

        is_read: false

      })

      .select()

      .single();

    if (error) throw error;

    const notifications =

      this.getNotifications();

    notifications.unshift(

      data as Notification

    );

    this.write(

      KEYS.NOTIFICATIONS,

      JSON.stringify(notifications)

    );

    return data as Notification;

  }

  public async notifyAdmins(

    title: string,

    message: string,

    type:

      | 'info'

      | 'success'

      | 'warning'

      | 'alert' = 'info'

  ): Promise<void> {

    const admins =

      this.getAllProfilesInternal().filter(

        profile =>

          profile.role === 'admin'

      );

    await Promise.all(

      admins.map(admin =>

        this.createNotification(

          admin.id,

          title,

          message,

          type

        )

      )

    );

  }

  public async notifyAllStudents(

    title: string,

    message: string,

    type:

      | 'info'

      | 'success'

      | 'warning'

      | 'alert' = 'info'

  ): Promise<void> {

    const students =

      this.getAllProfilesInternal().filter(

        profile =>

          profile.role === 'student'

      );

    await Promise.all(

      students.map(student =>

        this.createNotification(

          student.id,

          title,

          message,

          type

        )

      )

    );

  }

  public async markNotificationAsRead(

    id: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const { error } = await client

      .from('notifications')

      .update({

        is_read: true

      })

      .eq('id', id);

    if (error) throw error;

    const notifications =

      this.getNotifications().map(

        notification =>

          notification.id === id

            ? {

                ...notification,

                is_read: true

              }

            : notification

      );

    this.write(

      KEYS.NOTIFICATIONS,

      JSON.stringify(notifications)

    );

  }

  public async markAllNotificationsAsRead(

    userId: string

  ): Promise<void> {

    const client = this.requireSupabase();

    const { error } = await client

      .from('notifications')

      .update({

        is_read: true

      })

      .eq('user_id', userId)

      .eq('is_read', false);

    if (error) throw error;

    const notifications =

      this.getNotifications().map(

        notification =>

          notification.user_id === userId

            ? {

                ...notification,

                is_read: true

              }

            : notification

      );

    this.write(

      KEYS.NOTIFICATIONS,

      JSON.stringify(notifications)

    );

  }

}

export const db = new DatabaseService();