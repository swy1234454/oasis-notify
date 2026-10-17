if GetResourceState('oasis_notify') == 'started' then
    exports['oasis_notify']:Notify(data)
    return
end
