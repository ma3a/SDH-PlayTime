export const GameImage: React.FC<{ gameId: string; height: number }> = (props) => {
    const storeData = appStore.GetAppOverviewByAppID(parseInt(props.gameId))
    let img_src = ''
    if (storeData !== null) {
        img_src = appStore.GetCachedVerticalCapsuleURL(storeData)
        if (storeData.app_type == 1073741824) {
            img_src = `/customimages/${props.gameId}p.png?v=${storeData.rt_custom_image_mtime}`
        }
    }
    const def_img = '/images/defaultappimage.png'
    return (
        <img
            src={img_src}
            style={{ height: props.height }}
            onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = def_img
            }}
        />
    )
}
