import { ReactNode, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setAppState } from "../../redux/features/appStateSlice"

type Props = {
    state?: string,
    children: ReactNode,
    appState?: string,
}

const PageWrapper = (props: Props) => {
    const dispatch = useDispatch()
    useEffect(() => {
        if (props.appState)
            (dispatch(setAppState(props.appState))
            )
    }, [dispatch, props.appState]);
    return (
        <>
            {props.children}
        </>
    )
}

export default PageWrapper
