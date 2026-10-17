local ready, pending = false, {}
local function notify(data, notifyType, duration, subTitle)
    if type(data) ~= 'table' then
        data = { description = tostring(data or ''), type = notifyType, duration = duration, title = subTitle }
    end
    local kind = data.type or 'inform'
    if kind == 'info' or kind == 'primary' then kind = 'inform' end
    if not Config.Titles[kind] then kind = 'inform' end
    local title = data.title or data.text or Config.Titles[kind]
    local description = data.description or data.caption or ''
    local ms = tonumber(data.duration) or Config.Duration
    if ms ~= ms then ms = Config.Duration end
    local payload = {
        action = 'notify', id = data.id and tostring(data.id), type = kind,
        title = tostring(title):sub(1, 160), description = tostring(description):sub(1, 2000),
        duration = math.floor(math.max(500, math.min(ms, 60000))),
        position = data.position or Config.Position
    }
    if ready then SendNUIMessage(payload)
    else
        if #pending >= Config.MaxQueued then table.remove(pending, 1) end
        pending[#pending + 1] = payload
    end
end
exports('Notify', notify)
RegisterNetEvent('oasis_notify:client:notify', notify)
RegisterNUICallback('ready', function(_, cb)
    SendNUIMessage({ action = 'config', maxVisible = Config.MaxVisible, maxQueued = Config.MaxQueued, scale = Config.Scale })
    ready = true
    for i = 1, #pending do SendNUIMessage(pending[i]) end
    pending = {}
    cb({ ok = true })
end)
if Config.TestCommand then
    RegisterCommand(Config.TestCommand, function(_, args)
        if args[1] == 'qbx' then
            if GetResourceState('qbx_core') == 'started' then
                exports.qbx_core:Notify('QBX bildirimi Oasis üzerinden gösteriliyor.', 'success', 6000)
            else notify({ type = 'error', description = 'qbx_core çalışmıyor.' }) end
            return
        end
        if args[1] then
            notify({ type = args[1], description = table.concat(args, ' ', 2) ~= '' and table.concat(args, ' ', 2) or 'Bildirim testi başarılı.', duration = 6000 })
            return
        end
        CreateThread(function()
            for _, kind in ipairs({ 'success', 'warning', 'inform', 'error' }) do
                notify({ type = kind, description = 'Bildirim testi başarılı.', duration = 6500 })
                Wait(450)
            end
        end)
    end, false)
end
