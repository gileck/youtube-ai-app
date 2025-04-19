import { InfoOutlined } from "@mui/icons-material";
import { AiActionSingleChapter } from "..";
import { chapterPrompt } from "./chaptersPrompt";
import ProtocolDeepDiveRenderer from "./ProtocolDeepDiveRenderer";

export type ProtocolDeepDiveResult = {
  protocol: string;
  explanation: string;
  implementationDetails: string[];
  examples: string[];
  additionalNotes: string;
}

export type ProtocolDeepDiveParams = {
  protocol: string;
  chapterTitle: string;
}

export const protocolDeepDiveAction: AiActionSingleChapter<ProtocolDeepDiveResult, ProtocolDeepDiveParams> = {
  icon: InfoOutlined,
  label: 'Protocol Deep Dive',
  rendeder: ProtocolDeepDiveRenderer,
  mainPrompt: false,
  chapterPrompt,
  singleChapter: true
};
