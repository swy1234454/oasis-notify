-- No client -> server relay is exposed. Other server resources call this export.
exports('Notify', function(target, data, notifyType, duration, subTitle)
    target = tonumber(target)
    if not target or target < 1 or target % 1 ~= 0 or not GetPlayerName(target) then return false end
    TriggerClientEvent('oasis_notify:client:notify', target, data, notifyType, duration, subTitle)
    return true
end)
