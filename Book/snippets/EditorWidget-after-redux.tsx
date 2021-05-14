import * as React from "react"
import AceEditor from "react-ace"
import "ace-builds/src-noconflict/mode-typescript"
import "ace-builds/src-noconflict/theme-kuroir"
import { useEffect, useRef } from "react"
import * as styles from "../../../styles/modules/editor.module.scss"
import { useDispatch, useSelector } from "react-redux"
import Editor from "../../../enums/Editor"
import { codeChanged, tabClicked } from "../../../store/editors/editorsSlice"

export interface IEditorWidgetProps {
  editor: Editor
}

export function EditorWidget(props: IEditorWidgetProps) {
  const { editor } = props
  const { editorTitle, editorSettings } = useSelector(
    state => (state as any).editors.editors[editor]
  )
  const dispatch = useDispatch()
  const aceEditorRef = useRef<AceEditor>()

  const onChangeCode = (code: string) => {
    dispatch(codeChanged({
      editor,
      code,
    }))
  }

  const onChangeTab = (fileLabel: string) => {
    dispatch(tabClicked({
      editor,
      fileLabel,
    }))
  }

  // on mount: go to the top left of the editor
  useEffect(() => {
    const editor = aceEditorRef.current.editor
    editor.gotoLine(0, 0, false)
  }, [])

  return (
    <div
      className={`d-flex flex-column justify-content-center m-3 ${styles.editorWrapper}`}
    >
      {editorTitle && (
        <h3 className="text-primary text-underline">
          <u>{editorTitle}</u>
        </h3>
      )}
      {/* Tabs are always rendered */}
      <ul className="nav nav-tabs">
        {editorSettings.map(editorSettings => {
          const { fileLabel } = editorSettings
          const className = editorSettings.isActive
            ? "nav-link active font-monospace"
            : "nav-link font-monospace"
          return (
            <li className="nav-item" onClick={() => onChangeTab(fileLabel)}>
              <button className={className}>{fileLabel}</button>
            </li>
          )
        })}
      </ul>
      {/* For the editor, return an editor only the active one */}
      {editorSettings.map(editorSetting => {
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
            name={editor}
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