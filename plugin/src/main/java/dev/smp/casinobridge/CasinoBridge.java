package dev.smp.casinobridge;

import net.milkbowl.vault.economy.Economy;
import org.bukkit.*;
import org.bukkit.command.*;
import org.bukkit.entity.Player;
import org.bukkit.plugin.RegisteredServiceProvider;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;

import java.net.*;
import java.net.http.*;
import java.util.ArrayList;
import java.util.List;

public class CasinoBridge extends JavaPlugin implements CommandExecutor {

    private Economy eco;
    private String apiKey, backendUrl;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public void onEnable() {
        saveDefaultConfig();
        apiKey     = getConfig().getString("api-key","change-this-secret-key");
        backendUrl = getConfig().getString("backend-url","");
        if (!setupEconomy()) { getLogger().severe("Vault not found!"); setEnabled(false); return; }
        getCommand("cbridge").setExecutor(this);
        new BukkitRunnable() {
            @Override public void run() { pushBalances(); pollPending(); }
        }.runTaskTimerAsynchronously(this, 20L, 100L);
        getLogger().info("CasinoBridge v5 enabled! Backend: " + backendUrl);
    }

    @Override public void onDisable() {}

    private void pushBalances() {
        if (backendUrl==null||backendUrl.isEmpty()) return;
        List<Player> online=new ArrayList<>(Bukkit.getOnlinePlayers());
        if (online.isEmpty()) return;
        StringBuilder json=new StringBuilder("{\"players\":[");
        for (int i=0;i<online.size();i++) {
            Player p=online.get(i);
            json.append(String.format("{\"name\":\"%s\",\"balance\":%.2f}",p.getName(),eco.getBalance(p)));
            if (i<online.size()-1) json.append(",");
        }
        json.append("]}");
        try {
            HttpRequest req=HttpRequest.newBuilder().uri(URI.create(backendUrl+"/api/sync/balances"))
                .header("Content-Type","application/json").header("X-API-Key",apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(json.toString())).build();
            httpClient.send(req,HttpResponse.BodyHandlers.ofString());
        } catch (Exception e) { getLogger().warning("Push failed: "+e.getMessage()); }
    }

    private void pollPending() {
        if (backendUrl==null||backendUrl.isEmpty()) return;
        try {
            HttpRequest req=HttpRequest.newBuilder().uri(URI.create(backendUrl+"/api/sync/pending"))
                .header("X-API-Key",apiKey).GET().build();
            HttpResponse<String> resp=httpClient.send(req,HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode()!=200) return;
            String body=resp.body();
            if (!body.contains("\"name\":")) return;
            int idx=0;
            while ((idx=body.indexOf("\"name\":\"",idx))!=-1) {
                int ne=body.indexOf("\"",idx+8);
                String playerName=body.substring(idx+8,ne);
                int cs=body.indexOf("\"changes\":[",idx);
                if (cs==-1) break;
                int ce=body.indexOf("]",cs);
                String playerChanges=body.substring(cs+11,ce);
                int ci=0;
                while ((ci=playerChanges.indexOf("\"type\":\"",ci))!=-1) {
                    int te=playerChanges.indexOf("\"",ci+8);
                    String type=playerChanges.substring(ci+8,te);
                    int ai=playerChanges.indexOf("\"amount\":",ci);
                    if (ai==-1) break;
                    int ae=playerChanges.indexOf("}",ai);
                    double amount=Double.parseDouble(playerChanges.substring(ai+9,ae).trim());
                    final String pName=playerName,pType=type;
                    final double pAmount=amount;
                    Bukkit.getScheduler().runTask(this,()->{
                        OfflinePlayer p=Bukkit.getOfflinePlayer(pName);
                        if ("add".equals(pType)) {
                            boolean ok=eco.depositPlayer(p,pAmount).transactionSuccess();
                            if (ok&&p.isOnline()) p.getPlayer().sendMessage(
                                "\u00a7a[Casino] \u00a7f+\u00a7a"+String.format("%.0f",pAmount)+" coins \u00a7ffrom casino!");
                        } else {
                            if (eco.getBalance(p)>=pAmount) {
                                boolean ok=eco.withdrawPlayer(p,pAmount).transactionSuccess();
                                if (ok&&p.isOnline()) p.getPlayer().sendMessage(
                                    "\u00a7c[Casino] \u00a7f-\u00a7c"+String.format("%.0f",pAmount)+" coins \u00a7ffor casino bet.");
                            }
                        }
                    });
                    ci=te;
                }
                idx=ne;
            }
        } catch (Exception e) { getLogger().warning("Poll failed: "+e.getMessage()); }
    }

    @Override
    public boolean onCommand(CommandSender sender, Command cmd, String label, String[] args) {
        if (!(sender instanceof Player p)) { sender.sendMessage("\u00a7cIn-game only."); return true; }
        if (args.length==0) { p.sendMessage("\u00a76[Casino] \u00a7fUsage: \u00a7e/cbridge register \u00a7for \u00a7e/cbridge code"); return true; }

        if (args[0].equalsIgnoreCase("register")) {
            // New player wants to register - generate a registration code
            p.sendMessage("\u00a76[Casino] \u00a7fGenerating your registration code...");
            Bukkit.getScheduler().runTaskAsynchronously(this,()->{
                String code=callEndpoint("/api/register/generate", p.getName());
                Bukkit.getScheduler().runTask(this,()->{
                    if (code!=null) {
                        p.sendMessage("\u00a76[Casino] \u00a7f\u00a7lRegistration Code: \u00a7e\u00a7l"+code);
                        p.sendMessage("\u00a76[Casino] \u00a7fGo to the Casino website, click Register, and enter this code.");
                        p.sendMessage("\u00a77(Code expires in 10 minutes. One-time use only.)");
                    } else p.sendMessage("\u00a7c[Casino] \u00a7fCould not reach backend. Ask an admin.");
                });
            });
        } else if (args[0].equalsIgnoreCase("code")) {
            // Existing player wants to verify their MC account
            p.sendMessage("\u00a76[Casino] \u00a7fGenerating your verification code...");
            Bukkit.getScheduler().runTaskAsynchronously(this,()->{
                String code=callEndpoint("/api/verify/generate", p.getName());
                Bukkit.getScheduler().runTask(this,()->{
                    if (code!=null) {
                        p.sendMessage("\u00a76[Casino] \u00a7fVerification Code: \u00a7e\u00a7l"+code);
                        p.sendMessage("\u00a76[Casino] \u00a7fGo to the Casino website, open Verify page, and enter this code.");
                        p.sendMessage("\u00a77(Code expires in 5 minutes.)");
                    } else p.sendMessage("\u00a7c[Casino] \u00a7fCould not reach backend.");
                });
            });
        } else {
            p.sendMessage("\u00a76[Casino] \u00a7fUsage: \u00a7e/cbridge register \u00a7for \u00a7e/cbridge code");
        }
        return true;
    }

    private String callEndpoint(String path, String mcUsername) {
        try {
            String body=String.format("{\"mcUsername\":\"%s\"}",mcUsername);
            HttpRequest req=HttpRequest.newBuilder().uri(URI.create(backendUrl+path))
                .header("Content-Type","application/json").header("X-API-Key",apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body)).build();
            HttpResponse<String> resp=httpClient.send(req,HttpResponse.BodyHandlers.ofString());
            if (resp.statusCode()==200) { String c=parseStr(resp.body(),"code"); return c.isEmpty()?null:c; }
        } catch (Exception e) { getLogger().warning("Backend: "+e.getMessage()); }
        return null;
    }

    private boolean setupEconomy() {
        if (getServer().getPluginManager().getPlugin("Vault")==null) return false;
        var r=getServer().getServicesManager().getRegistration(Economy.class);
        if (r==null) return false; eco=r.getProvider(); return eco!=null;
    }
    private String parseStr(String j,String k) {
        try { int i=j.indexOf("\""+k+"\""); String s=j.substring(i+k.length()+3).trim(); if(s.startsWith("\"")){ s=s.substring(1); return s.substring(0,s.indexOf('"')); } return ""; }
        catch (Exception e) { return ""; }
    }
}
