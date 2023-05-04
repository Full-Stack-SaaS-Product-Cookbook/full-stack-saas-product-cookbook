import { Link } from "gatsby"
import * as React from "react"
import { showComplexToast } from "../../../helpers/ToastHelpers"
import * as styles from "../../../styles/modules/danger-asterisk.module.scss"

export function GeneratedCodeTitleWithWarning() {
  const handleOnClick = () => {
    showComplexToast(
      <>
        <p>
          The Redux patterns shown here are{" "}
          <b className="text-danger">deprecated</b>, namely the use of custom
          action functions and action verbs like "SET" that are not very
          descriptive.{" "}
        </p>
        <p>
          Redux maintainers recommend using{" "}
          <a href="https://redux-toolkit.js.org/">Redux Toolkit</a> for all new
          projects using Redux. While ReduxPlate <i>will</i> support these
          deprecated patterns for legacy projects, this MVP example is intended
          only to show the powers of ReduxPlate and get you interested in the
          full product.
        </p>
        <p>
          If you'd like to sign up for the full product which will include Redux
          Toolkit support, in addition to many other features, please sign up on
          the <Link to="/app">App</Link> page.
        </p>
      </>
    )
  }

  return (
    <>
      <u>Generated Code</u>
      <span
        className={`${styles.dangerAsterisk} text-danger`}
        onClick={handleOnClick}
      >
        *
      </span>
    </>
  )
}
