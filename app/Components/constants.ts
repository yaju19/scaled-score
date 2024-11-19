export const difficultyWeights = {
  "No Difficulty": 0,
  "Very Easy": 0.2,
  Easy: 0.4,
  Medium: 0.6,
  Hard: 0.8,
  "Very Hard": 1,
};

export interface FormValues {
  assessment_name: string;
  assessment_type: string;
  difficulty_weights: {
    "No Difficulty": number;
    "Very Easy": number;
    Easy: number;
    Medium: number;
    Hard: number;
    "Very Hard": number;
  };
  configuration_units: ConfigurationUnit[];
  configuration_type: string;
  score_aggregation_strategy: string;
  scoring_strategy: string;
  scaled_score_step_size: number;
}

export interface ConfigurationUnit {
  name: string;
  max_score: number;
  min_score: number;
  no_of_questions: number;
  section_details: SectionDetail[];
  mapping?: { score: number; value: number }[];
}

export interface SectionDetail {
  name: string;
  id: number;
  question_count: number;
}

export const assessmentSections = [
  { name: "section 1", id: 1, question_count: 27 },
  { name: "section 2", id: 2, question_count: 27 },
  { name: "section 3", id: 3, question_count: 22 },
  { name: "section 4", id: 4, question_count: 22 },
  { name: "section 5", id: 5, question_count: 75 },
  { name: "section 6", id: 6, question_count: 60 },
  { name: "section 7", id: 7, question_count: 40 },
  { name: "section 8", id: 8, question_count: 40 },
];

export const genericScaledScoreConfiguration: ConfigurationUnit[] = [];

export const satScaledScoreConfiguration: ConfigurationUnit[] = [
  {
    name: "Reading and Writing",
    max_score: 800,
    min_score: 200,
    no_of_questions: 0,
    section_details: [],
  },
  {
    name: "Math",
    max_score: 800,
    min_score: 200,
    no_of_questions: 0,
    section_details: [],
  },
];

export const actScaledScoreConfiguration: ConfigurationUnit[] = [
  {
    name: "English",
    max_score: 36,
    min_score: 1,
    no_of_questions: 0,
    section_details: [],
    mapping: undefined,
  },
  {
    name: "Math",
    max_score: 36,
    min_score: 1,
    no_of_questions: 0,
    section_details: [],
    mapping: undefined,
  },
  {
    name: "Reading",
    max_score: 36,
    min_score: 1,
    no_of_questions: 0,
    section_details: [],
    mapping: undefined,
  },
  {
    name: "Science",
    max_score: 36,
    min_score: 1,
    no_of_questions: 0,
    section_details: [],
    mapping: undefined,
  },
];
