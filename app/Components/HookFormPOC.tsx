"use client";

// app/components/HookFormPOC.tsx
import React, { useState } from "react";
import {
  useForm,
  SubmitHandler,
  useFieldArray,
  Controller,
} from "react-hook-form";
import Select from "react-select";
import {
  difficultyWeights,
  FormValues,
  assessmentSections,
  genericScaledScoreConfiguration,
  satScaledScoreConfiguration,
  actScaledScoreConfiguration,
} from "./constants";
import { schema } from "./validation";
import { yupResolver } from "@hookform/resolvers/yup";

const parseCSV = (csvText: string) => {
  const lines = csvText.split("\n");
  const result = [];

  // Ensure header is removed, and lines are processed only if valid
  for (let i = 1; i < lines.length; i++) {
    // Start from 1 to skip header
    const line = lines[i].trim(); // Remove whitespace
    if (line) {
      // Skip empty lines
      const [score, value] = line.split(",");
      if (!isNaN(Number(score)) && !isNaN(Number(value))) {
        // Ensure valid numbers
        result.push({
          score: Number(score.trim()),
          value: Number(value.trim()),
        });
      }
    }
  }
  return result;
};

const HookFormPOC: React.FC = () => {
  // Initialize the form with type definitions
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      assessment_type: "GENERIC",
      assessment_name: "assessment",
      configuration_type: "Category",
      score_aggregation_strategy: "Sum",
      scoring_strategy: "Weighted_Mean",
      configuration_units: [],
      difficulty_weights: difficultyWeights,
      scaled_score_step_size: 1,
    },
    resolver: yupResolver(schema),
  });

  console.log("====form errors", errors);
  const assessmentType = watch("assessment_type");
  const scoringStrategy = watch("scoring_strategy");
  // console.log(typeof assessmentType, "====type of assessment type");

  const { fields, remove, update, append } = useFieldArray({
    control,
    name: "configuration_units",
  });

  // console.log("==fields", fields);

  React.useEffect(() => {
    fields.forEach((field, index) => {
      const totalQuestions = field.section_details.reduce(
        (sum, section) => sum + section.question_count,
        0
      );
      setValue(`configuration_units.${index}.no_of_questions`, totalQuestions);
    });
  }, [fields, setValue]);

  const [unselectedSections, setUnselectedSections] =
    useState(assessmentSections);

  React.useEffect(() => {
    const selectedSections = fields.flatMap((unit) => unit.section_details);
    const newUnselectedSections = assessmentSections.filter(
      (section) =>
        !selectedSections.some((selected) => selected.id === section.id)
    );
    setUnselectedSections(newUnselectedSections);
  }, [fields]);

  React.useEffect(() => {
    if (assessmentType === "SAT") {
      setValue("configuration_type", "Category");
      setValue("score_aggregation_strategy", "Sum");
      setValue("scoring_strategy", "Weighted_Mean");
      setValue("scaled_score_step_size", 10);
    } else if (assessmentType === "ACT") {
      setValue("configuration_type", "Section");
      setValue("score_aggregation_strategy", "Average");
      setValue("scoring_strategy", "Mapped_Score");
      setValue("scaled_score_step_size", 1);
    }
  }, [assessmentType, setValue]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form Data=====:", data);
  };

  const handleAssessmentTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = event.target.value;
    if (selectedType === "GENERIC") {
      setValue("configuration_units", genericScaledScoreConfiguration);
    } else if (selectedType === "SAT") {
      setValue("configuration_units", satScaledScoreConfiguration);
    } else if (selectedType === "ACT") {
      setValue("configuration_units", actScaledScoreConfiguration);
    }
  };

  const handleFileUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        const mapping = parseCSV(csvText);
        update(index, {
          ...fields[index],
          mapping: mapping,
        });
      };
      reader.readAsText(file);
    }
  };

  const handleAddUnit = () => {
    append({
      name: "",
      max_score: 0,
      min_score: 0,
      no_of_questions: 0,
      section_details: [],
      mapping: undefined,
    });
  };

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl mb-4">React Hook Form POC with TypeScript</h1> */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="assessment_name" className="block mb-2 font-semibold">
            Assessment Name
          </label>
          <input
            id="assessment_name"
            {...register("assessment_name", { required: "Name is required" })}
            className="border p-2 w-full"
          />
          {errors.assessment_name && (
            <p className="text-red-500">{errors.assessment_name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="assessment_type" className="block mb-2 font-semibold">
            Assessment Type
          </label>
          <Controller
            name="assessment_type"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                onChange={(event) => {
                  field.onChange(event.target.value); // update the value using Controller's field.onChange
                  handleAssessmentTypeChange(event); // call your existing function if necessary
                }}
                className="border p-2 w-full"
              >
                <option value="GENERIC">GENERIC</option>
                <option value="SAT">SAT</option>
                <option value="ACT">ACT</option>
              </select>
            )}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="configuration_type"
            className="block mb-2 font-semibold"
          >
            Configuration Type
          </label>
          <Controller
            name="configuration_type"
            control={control}
            render={({ field }) => (
              <select {...field} className="border p-2 w-full">
                <option value="Category">Category</option>
                <option value="Section">Section</option>
              </select>
            )}
          />
          {errors.configuration_type && (
            <p className="text-red-500">{errors.configuration_type.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="score_aggregation_strategy"
            className="block mb-2 font-semibold"
          >
            Score Aggregation Strategy
          </label>
          <Controller
            name="score_aggregation_strategy"
            control={control}
            render={({ field }) => (
              <select {...field} className="border p-2 w-full">
                <option value="Sum">Sum</option>
                <option value="Average">Average</option>
              </select>
            )}
          />
          {errors.score_aggregation_strategy && (
            <p className="text-red-500">
              {errors.score_aggregation_strategy.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="scoring_strategy"
            className="block mb-2 font-semibold"
          >
            Scoring Strategy
          </label>
          <Controller
            name="scoring_strategy"
            control={control}
            render={({ field }) => (
              <select {...field} className="border p-2 w-full">
                <option value="Weighted_Mean">Weighted Mean</option>
                <option value="Mapped_Score">Mapped Score</option>
              </select>
            )}
          />
          {errors.scoring_strategy && (
            <p className="text-red-500">{errors.scoring_strategy.message}</p>
          )}
        </div>

        {scoringStrategy === "Weighted_Mean" && (
          <>
            <label className="block mb-2 font-semibold">
              Difficulty Weights
            </label>
            <div className="mb-4">
              {Object.keys(difficultyWeights).map((key) => (
                <React.Fragment key={key}>
                  <div className="mb-2 flex gap-x-2">
                    <label className="basis-1/6 block mb-1">{key}</label>
                    <input
                      type="number"
                      {...register(
                        `difficulty_weights.${
                          key as keyof typeof difficultyWeights
                        }`
                      )}
                      defaultValue={
                        difficultyWeights[key as keyof typeof difficultyWeights]
                      }
                      className="border p-2 w-full"
                    />
                  </div>
                  {errors.difficulty_weights &&
                    errors.difficulty_weights[
                      key as keyof typeof difficultyWeights
                    ] && (
                      <p className="text-red-500">
                        {
                          errors.difficulty_weights[
                            key as keyof typeof difficultyWeights
                          ]?.message
                        }
                      </p>
                    )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}

        <div className="mb-4">
          <label
            htmlFor="scaled_score_step_size"
            className="block mb-2 font-semibold"
          >
            Scaled Score Step Size
          </label>
          <input
            id="scaled_score_step_size"
            {...register("scaled_score_step_size", {
              required: "Step size is required",
            })}
            type="number"
            className="border p-2 w-full"
          />
          {errors.scaled_score_step_size && (
            <p className="text-red-500">
              {errors.scaled_score_step_size.message}
            </p>
          )}
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 border p-2">
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Name</label>
              <input
                {...register(`configuration_units.${index}.name`)}
                className="border p-2 w-full"
              />
            </div>
            {errors.configuration_units?.[index]?.name && (
              <p className="text-red-500">
                {errors.configuration_units[index].name?.message}
              </p>
            )}
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Max Score</label>
              <input
                type="number"
                {...register(`configuration_units.${index}.max_score`)}
                className="border p-2 w-full"
              />
            </div>
            {errors.configuration_units?.[index]?.max_score && (
              <p className="text-red-500">
                {errors.configuration_units[index].max_score?.message}
              </p>
            )}
            <div className="mb-2">
              <label className="block mb-1 font-semibold">Min Score</label>
              <input
                type="number"
                {...register(`configuration_units.${index}.min_score`)}
                className="border p-2 w-full"
              />
            </div>
            {errors.configuration_units?.[index]?.min_score && (
              <p className="text-red-500">
                {errors.configuration_units[index].min_score?.message}
              </p>
            )}
            <div className="mb-2">
              <label className="block mb-1 font-semibold">
                No of Questions
              </label>
              <input
                disabled
                type="number"
                {...register(`configuration_units.${index}.no_of_questions`)}
                className="border p-2 w-full"
              />
            </div>
            {errors.configuration_units?.[index]?.no_of_questions && (
              <p className="text-red-500">
                {errors.configuration_units[index].no_of_questions?.message}
              </p>
            )}
            <div className="mb-2">
              <label className="block mb-1 font-semibold">
                Section Details
              </label>
              <Controller
                name={`configuration_units.${index}.section_details`}
                control={control}
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      isMulti
                      options={unselectedSections.map((section) => ({
                        value: section.id,
                        label: `${section.name} question count - ${section.question_count}`,
                      }))}
                      value={field.value.map((section) => ({
                        value: section.id,
                        label: section.name,
                      }))}
                      className="border p-2 w-full"
                      onChange={(selectedOptions) => {
                        const updatedSections = selectedOptions
                          .map((option) =>
                            assessmentSections.find(
                              (
                                section
                              ): section is {
                                name: string;
                                id: number;
                                question_count: number;
                              } => section.id === option.value
                            )
                          )
                          .filter((section) => section !== undefined);
                        field.onChange(updatedSections);
                        update(index, {
                          ...fields[index],
                          section_details: updatedSections,
                        });
                      }}
                    />
                  );
                }}
              />
              {errors.configuration_units?.[index]?.section_details && (
                <p className="text-red-500">
                  {errors.configuration_units[index].section_details?.message}
                </p>
              )}
            </div>
            {field.mapping && (
              <div className="mb-2">
                <label className="block mb-1 font-semibold">Mapping</label>
                <details>
                  <summary>View Mapping</summary>
                  <ul>
                    {field.mapping.map((map, mapIndex) => (
                      <li key={mapIndex}>
                        <strong>Sr No: {mapIndex + 1}</strong> - Score:{" "}
                        {map.score}, Value: {map.value}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
            {assessmentType === "ACT" && (
              <div className="mb-2">
                <label className="block mb-1 font-semibold">
                  Upload CSV for Mapping
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(event) => handleFileUpload(index, event)}
                  className="border p-2 w-full"
                />
              </div>
            )}
            {errors.configuration_units?.[index]?.mapping && (
              <p className="text-red-500">
                {errors.configuration_units[index].mapping.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-10 bg-red-500 text-white p-2 rounded"
            >
              Remove Unit
            </button>

            {errors.configuration_units?.root && (
              <p className="mt-4 text-red-500">
                {errors.configuration_units.root?.message}
              </p>
            )}
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={handleAddUnit}
            className="bg-green-500 text-white p-2 rounded mb-4"
          >
            Add Unit
          </button>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Form Submit
        </button>
      </form>
    </div>
  );
};

export default HookFormPOC;
