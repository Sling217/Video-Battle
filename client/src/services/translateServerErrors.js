import _ from 'lodash'

let translateServerErrors = (errors) => {
  let serializedErrors = {}

  Object.keys(errors).forEach((key) => {
    const messages = errors[key].map((error) => {
      const field = _.startCase(key)
      if (key === "fullUrl") {
        serializedErrors = {
          ...serializedErrors,
          ["Video link"]: "is not a valid URL. Must include http/https."
        }
      } else if (key === "email") {
        if (error.keyword === "pattern") {
          serializedErrors = {
            ...serializedErrors,
            ["Email"]: "is invalid."
          }
        } else if (error.keyword === "unique") {
          serializedErrors = {
            ...serializedErrors,
            ["Email"]: "is is already in use."
          }
        }
      } else {
        serializedErrors = {
          ...serializedErrors,
          [field]: error.message
        }
      }
    })
  });
  return serializedErrors
};

export default translateServerErrors;
