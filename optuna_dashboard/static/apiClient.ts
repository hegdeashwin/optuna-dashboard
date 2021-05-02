import axios from "axios"

const axiosInstance = axios.create({ baseURL: API_ENDPOINT })

interface TrialResponse {
  trial_id: number
  study_id: number
  number: number
  state: TrialState
  values?: number[]
  intermediate_values: TrialIntermediateValue[]
  datetime_start?: string
  datetime_complete?: string
  params: TrialParam[]
  user_attrs: Attribute[]
  system_attrs: Attribute[]
}

const convertTrialResponse = (res: TrialResponse): Trial => {
  return {
    trial_id: res.trial_id,
    study_id: res.study_id,
    number: res.number,
    state: res.state,
    values: res.values,
    intermediate_values: res.intermediate_values,
    datetime_start: res.datetime_start
      ? new Date(res.datetime_start)
      : undefined,
    datetime_complete: res.datetime_complete
      ? new Date(res.datetime_complete)
      : undefined,
    params: res.params,
    user_attrs: res.user_attrs,
    system_attrs: res.system_attrs,
  }
}

interface StudyDetailResponse {
  name: string
  datetime_start: string
  directions: StudyDirection[]
  best_trial?: TrialResponse
  trials: TrialResponse[]
  intersection_search_space: SearchSpace[]
  union_search_space: SearchSpace[]
}

export const getStudyDetailAPI = (studyId: number): Promise<StudyDetail> => {
  return axiosInstance
    .get<StudyDetailResponse>(`/api/studies/${studyId}`, {})
    .then((res) => {
      const trials = res.data.trials.map(
        (trial): Trial => {
          return convertTrialResponse(trial)
        }
      )
      return {
        name: res.data.name,
        datetime_start: new Date(res.data.datetime_start),
        directions: res.data.directions,
        best_trial: res.data.best_trial
          ? convertTrialResponse(res.data.best_trial)
          : undefined,
        trials: trials,
        union_search_space: res.data.union_search_space,
        intersection_search_space: res.data.intersection_search_space,
      }
    })
}

interface StudySummariesResponse {
  study_summaries: {
    study_id: number
    study_name: string
    directions: StudyDirection[]
    best_trial?: {
      trial_id: number
      study_id: number
      number: number
      state: TrialState
      value?: number
      intermediate_values: TrialIntermediateValue[]
      datetime_start: string
      datetime_complete?: string
      params: TrialParam[]
      user_attrs: Attribute[]
      system_attrs: Attribute[]
    }
    user_attrs: Attribute[]
    system_attrs: Attribute[]
    datetime_start?: string
  }[]
}

export const getStudySummariesAPI = (): Promise<StudySummary[]> => {
  return axiosInstance
    .get<StudySummariesResponse>(`/api/studies`, {})
    .then((res) => {
      return res.data.study_summaries.map(
        (study): StudySummary => {
          const best_trial = study.best_trial
            ? convertTrialResponse(study.best_trial)
            : undefined
          return {
            study_id: study.study_id,
            study_name: study.study_name,
            directions: study.directions,
            best_trial: best_trial,
            user_attrs: study.user_attrs,
            system_attrs: study.system_attrs,
            datetime_start: study.datetime_start
              ? new Date(study.datetime_start)
              : undefined,
          }
        }
      )
    })
}

interface CreateNewStudyResponse {
  study_summary: {
    study_id: number
    study_name: string
    directions: StudyDirection[]
    best_trial?: {
      trial_id: number
      study_id: number
      number: number
      state: TrialState
      value?: number
      intermediate_values: TrialIntermediateValue[]
      datetime_start: string
      datetime_complete?: string
      params: TrialParam[]
      user_attrs: Attribute[]
      system_attrs: Attribute[]
    }
    user_attrs: Attribute[]
    system_attrs: Attribute[]
    datetime_start?: string
  }
}

export const createNewStudyAPI = (
  studyName: string,
  directions: StudyDirection[]
): Promise<StudySummary> => {
  return axiosInstance
    .post<CreateNewStudyResponse>(`/api/studies`, {
      study_name: studyName,
      directions,
    })
    .then((res) => {
      const study_summary = res.data.study_summary
      return {
        study_id: study_summary.study_id,
        study_name: study_summary.study_name,
        directions: study_summary.directions,
        // best_trial: undefined,
        user_attrs: study_summary.user_attrs,
        system_attrs: study_summary.system_attrs,
        datetime_start: study_summary.datetime_start
          ? new Date(study_summary.datetime_start)
          : undefined,
      }
    })
}

export const deleteStudyAPI = (studyId: number): Promise<unknown> => {
  return axiosInstance.delete(`/api/studies/${studyId}`).then(() => {
    return {}
  })
}

interface ParamImportancesResponse {
  target_name: string
  param_importances: ParamImportance[]
}

export const getParamImportances = (
  studyId: number
): Promise<ParamImportances> => {
  return axiosInstance
    .get<ParamImportancesResponse>(
      `/api/studies/${studyId}/param_importances`,
      {}
    )
    .then((res) => {
      return res.data
    })
}
