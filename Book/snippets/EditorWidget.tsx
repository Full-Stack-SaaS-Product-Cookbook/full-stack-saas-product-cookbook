import * as React from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import * as styles from "../../styles/modules/editor-widget.module.scss"
import { useState } from "react"
import GitHub from "monaco-themes/themes/GitHub.json"
import * as monaco from "monaco-editor/esm/vs/editor/editor.api"

export interface IEditorSettings {
  fileLabel: string
  code: string
  isActive: boolean
}

export interface IEditorWidgetProps {
  editorTitle?: string
  editorSettings: Array<IEditorSettings>
}

export function EditorWidget(props: IEditorWidgetProps) {
  const { editorTitle, editorSettings } = props
  const [editorSettingsState, setEditorSettingsState] = useState<
    Array<IEditorSettings>
  >(editorSettings)

  const onChangeTab = (fileLabel: string) => {
    setEditorSettingsState(
      editorSettingsState.map(editorSetting => {
        editorSetting.isActive = editorSetting.fileLabel === fileLabel
        return editorSetting
      })
    )
  }

  const handleOnMount = (
    _editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    monaco.editor.defineTheme("GitHub", GitHub as monaco.editor.IStandaloneThemeData)
    monaco.editor.setTheme("GitHub")
  }

  return (
    <div
      className={`d-flex flex-column justify-content-center m-3 ${styles.editorWrapper}`}
    >
      {editorTitle && (
        <h3 className="text-primary">
          <u>{editorTitle}</u>
        </h3>
      )}
      <ul className="nav nav-tabs">
        {editorSettings.map(editorSetting => {
          const { fileLabel, isActive } = editorSetting
          const className = isActive
            ? "nav-link active font-monospace"
            : "nav-link font-monospace"
          return (
            <li className="nav-item" onClick={() => onChangeTab(fileLabel)}>
              <button className={className}>{fileLabel}</button>
            </li>
          )
        })}
      </ul>
      {editorSettings.map(editorSetting => {
        const { code, isActive } = editorSetting
        return (
          <div className={isActive ? "d-block" : "d-none"}>
            <Editor
              height="500px"
              defaultLanguage="typescript"
              value={code}
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
              }}
              onMount={handleOnMount}
            />
          </div>
        )
      })}
    </div>
  )
}
