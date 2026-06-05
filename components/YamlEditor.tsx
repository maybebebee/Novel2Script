"use client";

import { useEffect, useState } from "react";
import type { ValidationIssue } from "@/lib/schema";

type YamlEditorProps = {
  initialYaml: string;
  usageNote?: string;
};

type ValidationState =
  | {
      status: "idle";
      issues: ValidationIssue[];
      message: string;
    }
  | {
      status: "valid";
      issues: ValidationIssue[];
      message: string;
    }
  | {
      status: "invalid";
      issues: ValidationIssue[];
      message: string;
    };

export function YamlEditor({ initialYaml, usageNote }: YamlEditorProps) {
  const [yamlText, setYamlText] = useState(initialYaml);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    status: "idle",
    issues: [],
    message: "",
  });

  useEffect(() => {
    setYamlText(initialYaml);
    setValidation({
      status: "idle",
      issues: [],
      message: "",
    });
  }, [initialYaml]);

  async function handleValidate() {
    setIsValidating(true);
    setValidation({
      status: "idle",
      issues: [],
      message: "",
    });

    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yamlText,
        }),
      });
      const data = (await response.json()) as {
        valid?: boolean;
        issues?: ValidationIssue[];
      };
      const issues = data.issues || [];

      if (data.valid) {
        setValidation({
          status: "valid",
          issues: [],
          message: "校验通过，当前 YAML 符合 Novel2Script Schema。",
        });
      } else {
        setValidation({
          status: "invalid",
          issues,
          message: "校验未通过，请根据以下问题修改 YAML。",
        });
      }
    } catch {
      setValidation({
        status: "invalid",
        issues: [
          {
            path: "network",
            message: "校验请求失败，请稍后重试。",
          },
        ],
        message: "校验未通过，请根据以下问题修改 YAML。",
      });
    } finally {
      setIsValidating(false);
    }
  }

  function handleExport() {
    const blob = new Blob([yamlText], {
      type: "text/yaml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "novel2script-output.yaml";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            生成的剧本 YAML
          </h3>
          {usageNote ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">{usageNote}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isValidating ? "正在校验..." : "校验 YAML"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            导出 YAML
          </button>
        </div>
      </div>

      <textarea
        value={yamlText}
        onChange={(event) => {
          setYamlText(event.target.value);
          setValidation({
            status: "idle",
            issues: [],
            message: "",
          });
        }}
        className="mt-4 h-96 w-full resize-y rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        spellCheck={false}
      />

      {validation.message ? (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            validation.status === "valid"
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <p className="font-semibold">{validation.message}</p>
          {validation.issues.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {validation.issues.map((issue, index) => (
                <li
                  key={`${issue.path}-${index}`}
                  className="rounded-md bg-white/70 px-3 py-2"
                >
                  <span className="font-mono text-xs">{issue.path}</span>
                  <span className="mx-2">-</span>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
