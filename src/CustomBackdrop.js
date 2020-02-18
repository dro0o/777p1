import React, { useState } from "react"
import Backdrop from "@material-ui/core/Backdrop"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff"
  }
}))

export default function CustomBackdrop({ openCmd }) {
  const classes = useStyles()
  const [open, setOpen] = useState(openCmd)
  setOpen(openCmd)
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Backdrop
        className={classes.backdrop}
        open={open}
        onClick={handleClose}
      ></Backdrop>
    </div>
  )
}
