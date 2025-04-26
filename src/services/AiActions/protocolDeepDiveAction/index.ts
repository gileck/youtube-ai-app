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
  isMainAction: false,
  icon: InfoOutlined,
  label: 'Protocol Deep Dive',
  renderer: ProtocolDeepDiveRenderer,
  mainPrompt: false,
  chapterPrompt,
  singleChapter: true
};
