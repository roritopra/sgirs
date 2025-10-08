import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface QuestionTooltipProps {
  content: string;
}

export const QuestionTooltip = ({ content }: QuestionTooltipProps) => {
  // Add error handling for tooltip rendering
  try {
    return (
      <Tooltip content={content}>
        <button 
          type="button" 
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
          aria-label="Más información"
        >
          <Icon icon="lucide:help-circle" className="w-5 h-5" />
        </button>
      </Tooltip>
    );
  } catch (error) {
    console.error("Error rendering tooltip:", error);
    return null;
  }
};