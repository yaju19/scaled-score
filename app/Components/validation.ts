import * as yup from "yup";

export const schema = yup.object().shape({
  assessment_name: yup.string().required("Assessment Name is required"),
  assessment_type: yup
    .string()
    .required("Assessment Type is required")
    .oneOf(["SAT", "ACT", "GENERIC"], "Invalid Assessment Type"),
  difficulty_weights: yup
    .object()
    .shape({
      "No Difficulty": yup
        .number()
        .required()
        .min(0, "Value must be non-negative"),
      "Very Easy": yup.number().required().min(0, "Value must be non-negative"),
      Easy: yup.number().required().min(0, "Value must be non-negative"),
      Medium: yup.number().required().min(0, "Value must be non-negative"),
      Hard: yup.number().required().min(0, "Value must be non-negative"),
      "Very Hard": yup.number().required().min(0, "Value must be non-negative"),
    })
    .required("Difficulty weights are required"),
  configuration_type: yup
    .string()
    .when("assessment_type", (assessment_type) => {
      if (typeof assessment_type === "string" && assessment_type == "SAT") {
        return yup
          .string()
          .oneOf(["Category"], "Configuration Type must be 'Category' for SAT");
      } else if (assessment_type === "ACT") {
        return yup
          .string()
          .oneOf(
            ["Sectional"],
            "Configuration Type must be 'Sectional' for ACT"
          );
      }
      return yup.string().required("Configuration Type is required");
    }),
  score_aggregation_strategy: yup
    .string()
    .when("assessment_type", (assessment_type) => {
      if (assessment_type == "SAT") {
        return yup
          .string()
          .oneOf(["Sum"], "Score Aggregation Strategy must be 'Sum' for SAT");
      } else if (assessment_type === "ACT") {
        return yup
          .string()
          .oneOf(
            ["Average"],
            "Score Aggregation Strategy must be 'Average' for ACT"
          );
      }
      return yup.string().required("Score Aggregation Strategy is required");
    }),
  scoring_strategy: yup.string().when("assessment_type", (assessment_type) => {
    if (assessment_type == "SAT") {
      return yup
        .string()
        .oneOf(
          ["Weighted_Mean"],
          "Scoring Strategy must be 'Weighted Mean' for SAT"
        );
    } else if (assessment_type == "ACT") {
      return yup
        .string()
        .oneOf(
          ["Mapped_Score"],
          "Scoring Strategy must be 'Mapping Type' for ACT"
        );
    }
    return yup.string().required("Scoring Strategy is required");
  }),
  configuration_units: yup
    .array()
    .when("assessment_type", (assessment_type, schema) => {
      if (assessment_type == "SAT") {
        return schema
          .of(
            yup.object().shape({
              name: yup.string().required("Name is required"),
              max_score: yup
                .number()
                .oneOf([800], "Max Score must be exactly 800 for SAT")
                .required(),
              min_score: yup
                .number()
                .oneOf([200], "Min Score must be exactly 200 for SAT")
                .required(),
              no_of_questions: yup
                .number()
                .test(
                  "no_of_questions",
                  "No of Questions must be 54 for the first unit or 44 for the second unit",
                  (value, context) => {
                    const index = context?.options?.index || 0;
                    return (
                      (index === 0 && value == 54) ||
                      (index === 1 && value == 44)
                    );
                  }
                ),
              section_details: yup
                .array()
                .of(
                  yup.object().shape({
                    name: yup.string().required("Section Name is required"),
                    id: yup.number().required("Section ID is required"),
                    question_count: yup
                      .number()
                      .required("Question Count is required"),
                  })
                )
                .length(2, "Each unit must have exactly 2 sections"),
              mapping: yup
                .mixed()
                .oneOf([undefined], "Mapping must be undefined for SAT"),
            })
          )
          .length(2, "There must be exactly 2 units for SAT");
      } else if (assessment_type == "ACT") {
        return schema
          .of(
            yup.object().shape({
              name: yup.string().required("Name is required"),
              max_score: yup
                .number()
                .max(36, "Max Score must be 36 for ACT")
                .required(),
              min_score: yup
                .number()
                .min(1, "Min Score must be 1 for ACT")
                .required(),
              no_of_questions: yup
                .number()
                .test(
                  "no_of_questions",
                  "No of Questions must be 75, 60, 40, or 40 for ACT units",
                  (value, context) => {
                    const index = context?.options?.index || 0;
                    const expectedQuestions = [75, 60, 40, 40];
                    return value === expectedQuestions[index];
                  }
                ),
              section_details: yup
                .array()
                .of(
                  yup.object().shape({
                    name: yup.string().required("Section Name is required"),
                    id: yup.number().required("Section ID is required"),
                    question_count: yup
                      .number()
                      .required("Question Count is required"),
                  })
                )
                .length(1, "Each unit must have exactly 1 section for ACT"),
              mapping: yup
                .array()
                .of(
                  yup.object().shape({
                    score: yup.number().required("Score is required"),
                    value: yup.number().required("Value is required"),
                  })
                )
                .required("Mapping is required for ACT")
                .test(
                  "mapping-length",
                  "The number of elements in the mapping array must match the number of questions for this unit",
                  function (value) {
                    // `value` is the current value of `mapping`
                    // `this.parent` gives access to the parent object (i.e., the containing unit)
                    const noOfQuestions = this.parent?.no_of_questions || 0;
                    return (
                      Array.isArray(value) && value.length === noOfQuestions
                    );
                  }
                ),
            })
          )
          .length(4, "There must be exactly 4 units for ACT");
      } else if (assessment_type == "GENERIC") {
        // Fallback case specifically for GENERIC
        return schema.of(
          yup.object().shape({
            name: yup.string().required("Name is required"),
            max_score: yup.number().min(1, "Max Score must be greater than 0"),
            min_score: yup.number().min(1, "Min Score must be greater than 0"),
            no_of_questions: yup
              .number()
              .min(1, "No of Questions must be greater than 0"),
            section_details: yup
              .array()
              .of(
                yup.object().shape({
                  name: yup.string().required("Section Name is required"),
                  id: yup.number().required("Section ID is required"),
                  question_count: yup
                    .number()
                    .required("Question Count is required"),
                })
              )
              .min(1, "Each unit must have at least 1 section"),
            mapping: yup.mixed().nullable(),
          })
        );
      }
      return schema; // Optional: If you want to handle other unexpected cases
    }),
});
