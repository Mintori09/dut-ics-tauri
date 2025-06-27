export type TranslateInput = {
  input_path: string;
  output_path: string;
  from: string;
  to: string;
};

export type TranslateOutput = {
  translate_input: TranslateInput;
  is_translated: boolean;
};
