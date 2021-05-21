import * as React from "react"
import * as styles from "../../styles/modules/editor.module.scss"
import EditorID from "../../enums/EditorID"
import { codeEdited, tabClicked } from "../../store/editors/editorsSlice"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import Editor from "@monaco-editor/react"

export interface IEditorWidgetProps {
  editorID: EditorID
}

export function EditorWidget(props: IEditorWidgetProps) {
  const { editorID } = props
  const { editorTitle, editorSettings } = useAppSelector(
    state => state.editors.editors[editorID]
  )
  const dispatch = useAppDispatch()

  const onChangeCode = (code: string) => {
    dispatch(
      codeEdited({
        editorID,
        code,
      })
    )
  }

  const onChangeTab = (fileLabel: string) => {
    dispatch(
      tabClicked({
        editorID,
        fileLabel,
      })
    )
  }

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
          <Editor
            height="500px"
            defaultLanguage="typescript"
            defaultValue={editorSetting.code}
            options={{
              minimap: { enabled: false },
            }}
            onChange={onChangeCode}
          />
        ) : (
          <></>
        )
      })}
    </div>
  )
}
