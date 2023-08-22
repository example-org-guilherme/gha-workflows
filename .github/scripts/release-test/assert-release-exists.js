
module.exports = async ({ github, context, core }) => {

  const releaseTag = process.env.RELEASE_TAG
  console.info("Looking for release with tag [%s] for repo [%s/%s]", releaseTag, context.repo.owner, context.repo.repo)

  const release = (
    await github.rest.repos.getReleaseByTag({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag: releaseTag
    }).catch(e => {
      console.error("Error upon trying to find release:", e)
      if (e.status == 404) {
        return 
      } else {
        throw e
      }
    })
  )

  if (!release) {
    core.setFailed(`Test failed, could not find release with tag [${releaseTag}]`)
  }

}