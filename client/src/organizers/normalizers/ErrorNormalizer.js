export default function ErrorNormalizer(errors) {
    let nextErrors = {...errors}
    Object.keys(nextErrors).forEach((type) => {
        nextErrors = {
            ...nextErrors,
            [type]: nextErrors[type]
                ? nextErrors[type].filter(
                      (bin) => bin.IBIN === 0 || bin.ISB === 'NO',
                  )
                : [],
        }
    })
    return nextErrors
}
