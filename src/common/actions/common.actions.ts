import { createAction } from "@reduxjs/toolkit";

const increment = createAction<number | undefined>("common/increment");
