// Managers are scoped to their own direct reports; Leadership sees everything.
function teamFilter(reqUser) {
  return reqUser.role === "Leadership" ? {} : { managerId: reqUser.id };
}

module.exports = { teamFilter };
