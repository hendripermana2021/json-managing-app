import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DataRecord, DuplicateModes } from "../types/json";
import { createHashKey } from "../algorithms/duplicate";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface AddRecordFormProps {
  fields: string[];
  records: DataRecord[];
  duplicateFields: string[];
  duplicateModes: DuplicateModes;
  onSubmitRecord: (record: DataRecord) => void;
  onMergeRecord: (record: DataRecord) => void;
}

export function AddRecordForm({
  fields,
  records,
  duplicateFields,
  duplicateModes,
  onSubmitRecord,
  onMergeRecord,
}: AddRecordFormProps) {
  const shape = useMemo(() => {
    const dynamicFields = fields.length ? fields : ["field"];
    return dynamicFields.reduce<Record<string, z.ZodString>>((acc, field) => {
      acc[field] = z.string().min(1, `${field} wajib diisi`);
      return acc;
    }, {});
  }, [fields]);

  const schema = useMemo(() => z.object(shape), [shape]);

  const { register, handleSubmit, reset, formState } = useForm<Record<string, string>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(Object.keys(shape).map((key) => [key, ""])),
  });

  const onSubmit = (values: Record<string, string>) => {
    const record = values as DataRecord;
    const fieldsToCheck = duplicateFields.length ? duplicateFields : Object.keys(values);
    const hash = createHashKey(record, fieldsToCheck, duplicateModes);
    const exists = records.some((row) => createHashKey(row, fieldsToCheck, duplicateModes) === hash);

    if (!exists) {
      onSubmitRecord(record);
      reset();
      return;
    }

    const message = fieldsToCheck
      .map((field) => `${field}='${String(record[field] ?? "")}'`)
      .join(" dan ");

    const choice = window.confirm(`Data dengan ${message} sudah ada. Klik OK untuk merge, Cancel untuk batal.`);
    if (choice) {
      onMergeRecord(record);
      reset();
    }
  };

  const fieldsToRender = Object.keys(shape);

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-100">Tambah Data Baru</h3>
      <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        {fieldsToRender.map((field) => (
          <div key={field}>
            <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">{field}</label>
            <Input {...register(field)} placeholder={`Isi ${field}`} />
            {formState.errors[field] ? (
              <p className="mt-1 text-xs text-rose-300">{formState.errors[field]?.message}</p>
            ) : null}
          </div>
        ))}

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit">Simpan</Button>
          <Button type="button" variant="secondary" onClick={() => reset()}>
            Reset
          </Button>
        </div>
      </form>
    </Card>
  );
}
