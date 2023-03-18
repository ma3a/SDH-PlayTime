import { createContext, useContext, useEffect, useState } from 'react'
import { Locator, LocatorDependencies } from './app/system'
import { DEFAULTS, PlayTimeSettings } from './app/settings'

const LocatorContext = createContext<Locator | null>(null)

export const LocatorProvider: React.FC<LocatorDependencies> = ({ children, ...deps }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [currentSettings, setCurrentSettings] = useState<PlayTimeSettings>(DEFAULTS)

    useEffect(() => {
        setIsLoaded(false)
        deps.settings.get().then((it) => {
            setCurrentSettings(it)
            setIsLoaded(true)
        })
    }, [])
    let locator: Locator = {
        ...deps,
        currentSettings: currentSettings,
    }
    if (!isLoaded) {
        return <div></div>
    }
    return <LocatorContext.Provider value={locator}>{children}</LocatorContext.Provider>
}

export const useLocator = () => {
    const locator = useContext(LocatorContext)
    if (!locator) {
        throw new Error('Locator not found')
    }
    return locator
}
