"use client";

import { useState } from "react";
import { Button, Input, Popover, PopoverContent, PopoverTrigger, Select, SelectItem, Checkbox } from "@heroui/react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import { TIPOS_VIA, ORIENTACIONES, generarLetrasAbecedario } from "@/constants/shared/authConstants";

export interface AddressBuilderPopoverProps {
  value?: string;
  onChange: (direccion: string) => void;
  label?: string;
  required?: boolean;
  addLabel?: string;
  editLabel?: string;
}

export default function AddressBuilderPopover({
  value,
  onChange,
  label = "Dirección",
  required = false,
  addLabel = "Agregar dirección",
  editLabel = "Editar",
}: AddressBuilderPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tipoVia, setTipoVia] = useState<string>("");
  const [numeroVia, setNumeroVia] = useState<string>("");
  const [letraVia, setLetraVia] = useState<string>("");
  const [isBis, setIsBis] = useState<boolean>(false);
  const [letraBis, setLetraBis] = useState<string>("");
  const [orientacion, setOrientacion] = useState<string>("");
  const [numeroCruce, setNumeroCruce] = useState<string>("");
  const [letraCruce, setLetraCruce] = useState<string>("");
  const [numeroPlaca, setNumeroPlaca] = useState<string>("");
  const [complemento, setComplemento] = useState<string>("");

  function construirDireccion(): string {
    const partes: string[] = [];

    if (tipoVia) {
      let parte = tipoVia;
      if (numeroVia) parte += " " + numeroVia;
      if (letraVia) parte += letraVia;
      if (isBis) {
        parte += " BIS";
        if (letraBis) parte += " " + letraBis;
      }
      if (orientacion) parte += " " + orientacion;
      partes.push(parte);
    }

    if (numeroCruce) {
      let cruce = "# " + numeroCruce;
      if (letraCruce) cruce += letraCruce;
      partes.push(cruce);
    }

    if (numeroPlaca) partes.push("- " + numeroPlaca);
    if (complemento) partes.push(complemento);

    let direccionCompleta = "";
    if (partes.length > 0) {
      if (complemento && partes.length > 1) {
        const partesBasicas = partes.slice(0, -1).join(" ");
        direccionCompleta = partesBasicas + ", " + partes[partes.length - 1];
      } else {
        direccionCompleta = partes.join(" ");
      }
    }

    return direccionCompleta.trim();
  }

  function validarCampos(): { valido: boolean; errores: string[] } {
    let valido = true;
    const errores: string[] = [];
    if (!tipoVia) { valido = false; errores.push("Tipo de vía"); }
    if (!numeroVia) { valido = false; errores.push("Número de vía"); }
    if (!numeroCruce) { valido = false; errores.push("Número de cruce"); }
    if (!numeroPlaca) { valido = false; errores.push("Número de placa"); }
    return { valido, errores };
  }

  function handleSave() {
    const { valido, errores } = validarCampos();
    if (!valido) {
      alert(`Por favor complete los siguientes campos obligatorios: ${errores.join(", ")}`);
      return;
    }
    const direccion = construirDireccion();
    onChange(direccion);
    setIsOpen(false);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-foreground" id="address-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500" id="address-display" aria-live="polite">
            {value ? value : "No especificada"}
          </p>
          <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            placement="top"
            shouldCloseOnScroll={false}
          >
            <PopoverTrigger>
              <Button
                variant="flat"
                color="primary"
                startContent={<MapPinIcon className="w-5 h-6" aria-hidden="true" />}
                className="text-primary"
                aria-label={value ? editLabel : addLabel}
                aria-describedby="address-display"
                aria-expanded={isOpen}
              >
                {value ? editLabel : addLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="lg:w-[600px]">
              <div
                className="space-y-4 p-4 w-full"
                role="dialog"
                aria-labelledby="address-dialog-title"
                aria-describedby="address-dialog-description"
              >
                <h3 id="address-dialog-title" className="text-lg font-semibold mb-4">
                  {label}
                </h3>
                <p id="address-dialog-description" className="sr-only">
                  Complete los campos para construir la dirección
                </p>
                <div className="flex flex-col gap-4 w-full lg:grid lg:grid-cols-2">
                  <Select
                    id="via"
                    label="Vía"
                    placeholder="Seleccione tipo de vía"
                    selectedKeys={tipoVia ? [tipoVia] : []}
                    onSelectionChange={(keys) => {
                      const [first] = Array.from(keys as Set<string>);
                      setTipoVia(first || "");
                    }}
                    selectionMode="single"
                    variant="bordered"
                    className="col-span-1"
                    aria-haspopup="listbox"
                    data-testid="via-select"
                    role="combobox"
                    isRequired
                    aria-label="Seleccionar tipo de vía para la dirección"
                    listboxProps={{ id: 'via-listbox' }}
                  >
                    {TIPOS_VIA.map((tipo) => (
                      <SelectItem key={tipo} id="via-listbox" data-testid={`via-option-${tipo}`}>{tipo}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Número"
                    placeholder="Número"
                    type="number"
                    value={numeroVia}
                    onChange={(e) => setNumeroVia(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    isRequired
                    aria-label="Número de la vía principal"
                  />

                  <Select
                    label="Letra"
                    placeholder="Letra"
                    selectedKeys={letraVia ? [letraVia] : []}
                    onChange={(e) => setLetraVia(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    aria-label="Letra complementaria de la vía (opcional)"
                  >
                    {generarLetrasAbecedario().map((letra) => (
                      <SelectItem key={letra}>{letra}</SelectItem>
                    ))}
                  </Select>

                  <Checkbox
                    checked={isBis}
                    onChange={(e) => setIsBis(e.target.checked)}
                    className="col-span-1"
                    aria-describedby="bis-help"
                  >
                    BIS
                  </Checkbox>
                  <div id="bis-help" className="sr-only">
                    Marque si la dirección incluye BIS
                  </div>

                  <Select
                    label="Letra BIS"
                    placeholder="Letra BIS"
                    selectedKeys={letraBis ? [letraBis] : []}
                    onChange={(e) => setLetraBis(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    isDisabled={!isBis}
                    aria-label="Letra BIS (solo disponible si se marcó BIS)"
                  >
                    {generarLetrasAbecedario().map((letra) => (
                      <SelectItem key={letra}>{letra}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Orientación"
                    placeholder="Orientación"
                    selectedKeys={orientacion ? [orientacion] : []}
                    onChange={(e) => setOrientacion(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    aria-label="Orientación geográfica de la vía"
                  >
                    {ORIENTACIONES.map((o) => (
                      <SelectItem key={o}>{o}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Número cruce"
                    placeholder="Número cruce"
                    type="number"
                    value={numeroCruce}
                    onChange={(e) => setNumeroCruce(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    isRequired
                    aria-label="Número de la vía de cruce"
                  />

                  <Select
                    label="Letra cruce"
                    placeholder="Letra cruce"
                    selectedKeys={letraCruce ? [letraCruce] : []}
                    onChange={(e) => setLetraCruce(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    aria-label="Letra complementaria de la vía de cruce (opcional)"
                  >
                    {generarLetrasAbecedario().map((letra) => (
                      <SelectItem key={letra}>{letra}</SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Número placa"
                    placeholder="Número placa"
                    type="number"
                    value={numeroPlaca}
                    onChange={(e) => setNumeroPlaca(e.target.value)}
                    variant="bordered"
                    className="col-span-1"
                    isRequired
                    aria-label="Número de placa o inmueble"
                  />

                  <Input
                    label="Complemento"
                    placeholder="Complemento dirección (edificio, apartamento, etc.)"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    variant="bordered"
                    className="col-span-2"
                    aria-label="Información adicional como edificio, apartamento, local, etc."
                  />
                </div>
                <div className="mt-8">
                  <Button color="primary" fullWidth onPress={handleSave} aria-label="Guardar dirección construida">
                    Guardar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
