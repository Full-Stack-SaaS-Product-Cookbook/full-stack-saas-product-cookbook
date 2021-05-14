import * as React from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-typescript"
import "ace-builds/src-noconflict/theme-kuroir"
import { useEffect, useRef, useState } from "react"
import IEditorSetting from "../../../interfaces/IEditorSettings"
import * as styles from '../../../styles/modules/editor.module.scss'

export interface IEditorWidgetProps {
  editorTitle?: string
  editorSettings: Array<IEditorSetting>
}

export function EditorWidget(props: IEditorWidgetProps) {
  const { editorTitle, editorSettings } = props
  const [editorSettingsState, setEditorSettingsState] = useState<
    Array<IEditorSetting>
  >(editorSettings)
  const aceEditorRef = useRef<AceEditor>()

  const onChangeCode = (code: string) => {
    // only modify the code string of the file which is active
    setEditorSettingsState(editorSettingsState.map(editorSetting => {
      if (editorSetting.isActive) {
        editorSetting.code = code
      }
      return editorSetting
    }))
  }

  const onChangeTab = (fileLabel: string) => {
    setEditorSettingsState(editorSettingsState.map(editorSetting => {
      if (editorSetting.fileLabel === fileLabel) {
        editorSetting.isActive = true
      } else {
        editorSetting.isActive = false
      }
      return editorSetting
    }))
  }


  // on mount: go to the top left of the editor
  useEffect(() => {
    const editor = aceEditorRef.current.editor
    editor.gotoLine(0, 0, false)
  }, [])

  return (
    <div className={`d-flex flex-column justify-content-center m-3 ${styles.editorWrapper}`}>
      {editorTitle && <h3 className="text-primary text-underline"><u>{editorTitle}</u></h3>}
      {/* Tabs are always rendered */}
      <ul className="nav nav-tabs">
        {editorSettingsState
          .map(editorSettings => {
            const { fileLabel } = editorSettings;
            const className =
            editorSettings.isActive
                ? "nav-link active font-monospace"
                : "nav-link font-monospace"
            return (
              <li className="nav-item" onClick={() => onChangeTab(fileLabel)}>
                <button className={className}>
                  {fileLabel}
                </button>
              </li>
            )
          })}
      </ul>
      {/* For the editor, return an editor only the active one */}
      {editorSettingsState.map(editorSetting => {
        return editorSetting.isActive ? (
          <AceEditor
            className={styles.editor}
            ref={aceEditorRef}
            mode="typescript"
            theme="kuroir"
            onChange={onChangeCode}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            name={editorTitle.split(' ').join('-').toLowerCase()}
            value={editorSetting.code}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        ) : (
          <></>
        )
      })}
    </div>
  )
}
