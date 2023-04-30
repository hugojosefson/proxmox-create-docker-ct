import { run, Select } from "./deps.ts";

export interface ChooseOneOptions<T> {
  choices: T[];
  valueProperty: string;
  message?: string;
  search?: boolean;
}

export async function chooseOne<T>(
  {
    choices,
    valueProperty,
    message = "Choose one.",
    search = true,
  }: ChooseOneOptions<T>,
): Promise<T> {
  if (choices.length === 1 && choices[0]) {
    return choices[0];
  }
  const choiceValue: string = await Select.prompt({
    message,
    search,
    options: await toSelectOptions(
      choices as unknown as Record<string, unknown>[],
      valueProperty,
    ),
  });
  const choice: T | undefined = choices
    .find(
      (possibleChoice) =>
        (possibleChoice as unknown as Record<string, string>)[valueProperty] ===
          choiceValue,
    );
  if (!choice) {
    throw new Error(
      `Unexpectedly could not find your choice "${choiceValue}", in the list.`,
    );
  }
  return choice;
}

async function toSelectOptions<T extends Record<string, unknown>>(
  items: T[],
  valueProperty: string,
): Promise<{ name?: string; value: string; disabled?: boolean }[]> {
  if (items.length === 0) {
    return [];
  }
  const headerLineInput: string = Object.keys(items[0]).join(" ");
  const table: string = await run(
    "column --table",
    {
      stdin: [
        headerLineInput,
        ...items.map((item) => Object.values(item).join(" ")),
      ].join("\n"),
    },
  );
  const tableLines = table.split("\n");
  const tableWidth = Math.max(...tableLines.map((line) => line.length));

  const [headerLine, ...lines] = tableLines;
  return [
    { name: headerLine, value: "", disabled: true },
    Select.separator("-".repeat(tableWidth)),
    ...lines.map((line, index) => ({
      name: line,
      value: (items[index] && (items[index][valueProperty] as string)) ?? "",
    })),
  ];
}
