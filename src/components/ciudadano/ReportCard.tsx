import { Tooltip, Chip, Button } from "@heroui/react";
import {
  ExclamationCircleIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface ReportCardProps {
  date: string;
  period: string;
  isCompleted?: boolean;
  linkUrl: string;
  canEnter?: boolean;
}

export default function ReportCard({
  date,
  period,
  isCompleted = false,
  linkUrl,
  canEnter = true,
}: ReportCardProps) {
  const router = useRouter();
  return (
    <article className="flex items-center flex-col gap-8 p-5 border border-gray-200 bg-white rounded-xl w-full md:justify-between md:flex-row">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <h2 className="font-medium text-gray-900">
            {isCompleted ? "Reporte completado" : "Reporte pendiente"}
          </h2>
          {isCompleted ? (
            <Tooltip
              content="El formulario ha sido completado correctamente."
              color="success"
            >
              <CheckCircleIcon className="w-6 h-6 text-success" />
            </Tooltip>
          ) : (
            <Tooltip
              content="El formulario no ha sido terminado. Por favor completelo."
              color="warning"
            >
              <ExclamationCircleIcon className="w-6 h-6 text-warning" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-gray-400 text-sm">Fecha: {date}</p>
          <Chip size="sm" variant="flat">
            {period}
          </Chip>
        </div>
      </div>
      <Button
        color="primary"
        variant={isCompleted ? "light" : "solid"}
        endContent={<ChevronRightIcon className="w-5 h-5" />}
        isDisabled={!isCompleted && !canEnter}
        aria-disabled={!isCompleted && !canEnter}
        onPress={() => {
          if (!isCompleted && !canEnter) return;
          router.push(linkUrl);
        }}
        className="w-full md:w-auto"
      >
        {isCompleted ? "Ver resumen" : "Terminar formulario"}
      </Button>
    </article>
  );
}
