import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, Cookie, Lock } from 'lucide-react'

const Section = ({title,children}:{title:string;children:React.ReactNode}) => (
  <div style={{marginBottom:28}}>
    <h2 className="playfair" style={{fontSize:18,fontWeight:600,marginBottom:12,color:'var(--text1)'}}>{title}</h2>
    <div style={{fontSize:14,color:'var(--text2)',lineHeight:1.8}}>{children}</div>
  </div>
)

export function Terms() {
  return(
    <div className="gp" style={{maxWidth:800}}>
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><FileText size={22} color="var(--gold)"/><h1 className="tg playfair" style={{fontSize:26,fontWeight:900}}>Terms of Service</h1></div>
        <p style={{color:'var(--text2)',fontSize:13}}>Last updated: March 2026 · Dev-SMP Casino by Schmesmalo</p>
      </div>
      <div className="card-flat" style={{padding:32}}>
        <Section title="1. Acceptance of Terms">
          <p>By accessing and using Dev-SMP Casino ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </Section>
        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to use this Service. You must be an active player on the Dev-SMP Minecraft server. By registering, you confirm that you meet these requirements.</p>
        </Section>
        <Section title="3. Virtual Currency">
          <p>All currency on Dev-SMP Casino is virtual and tied to the Dev-SMP Minecraft server economy (Vault). This currency has no real-world monetary value. You cannot exchange casino coins for real money. The operator reserves the right to adjust balances at any time.</p>
        </Section>
        <Section title="4. Fair Play">
          <p>All games use randomized outcomes. Attempting to exploit, hack, or manipulate the Service is strictly prohibited and will result in permanent account termination. The house edge is applied to all games as disclosed on each game page.</p>
        </Section>
        <Section title="5. Account Security">
          <p>You are responsible for maintaining the confidentiality of your account credentials. Sharing accounts is prohibited. Each Minecraft account may only be linked to one casino account. We are not responsible for unauthorized access to your account.</p>
        </Section>
        <Section title="6. Responsible Gaming">
          <p>Dev-SMP Casino is intended for entertainment only. If gambling is causing problems in your life, please seek help. We reserve the right to limit or suspend accounts that show signs of problematic behavior.</p>
        </Section>
        <Section title="7. Modifications">
          <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
        </Section>
        <Section title="8. Disclaimer">
          <p>The Service is provided "as is" without warranties of any kind. We are not liable for any losses incurred through use of the Service.</p>
        </Section>
      </div>
      <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap'}}>
        <Link to="/privacy" style={{color:'var(--gold)',fontSize:13}}>Privacy Policy</Link>
        <Link to="/cookies" style={{color:'var(--gold)',fontSize:13}}>Cookie Policy</Link>
        <Link to="/impressum" style={{color:'var(--gold)',fontSize:13}}>Impressum</Link>
      </div>
    </div>
  )
}

export function Privacy() {
  return(
    <div className="gp" style={{maxWidth:800}}>
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><Lock size={22} color="var(--gold)"/><h1 className="tg playfair" style={{fontSize:26,fontWeight:900}}>Privacy Policy</h1></div>
        <p style={{color:'var(--text2)',fontSize:13}}>Last updated: March 2026 · Dev-SMP Casino</p>
      </div>
      <div className="card-flat" style={{padding:32}}>
        <Section title="1. Data We Collect">
          <p>We collect: Your Minecraft username, a casino display name, a hashed password (SHA-256 + salt), game history, and balance information. We do not collect email addresses, real names, or payment information.</p>
        </Section>
        <Section title="2. How We Store Data">
          <p>All personal data is stored locally in your browser (localStorage). Balance data is synced with our backend server to connect with the Minecraft server economy. We do not use external databases or third-party analytics.</p>
        </Section>
        <Section title="3. Data Sharing">
          <p>We do not sell, trade, or share your personal data with third parties. Your balance data is shared only with the Dev-SMP Minecraft server for economy synchronization.</p>
        </Section>
        <Section title="4. Your Rights">
          <p>You may delete your account at any time by clearing your browser's localStorage. Contact the server owner (Schmesmalo) for any data-related requests.</p>
        </Section>
        <Section title="5. Security">
          <p>Passwords are hashed using SHA-256 with a random 16-byte salt. We never store plain-text passwords. API communication is protected by a secret API key.</p>
        </Section>
        <Section title="6. Contact">
          <p>For privacy concerns, contact Schmesmalo on the Dev-SMP Discord server.</p>
        </Section>
      </div>
    </div>
  )
}

export function Cookies() {
  return(
    <div className="gp" style={{maxWidth:800}}>
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><Cookie size={22} color="var(--gold)"/><h1 className="tg playfair" style={{fontSize:26,fontWeight:900}}>Cookie Policy</h1></div>
        <p style={{color:'var(--text2)',fontSize:13}}>Last updated: March 2026 · Dev-SMP Casino</p>
      </div>
      <div className="card-flat" style={{padding:32}}>
        <Section title="What We Use">
          <p>Dev-SMP Casino does not use traditional cookies. Instead, we use browser <strong style={{color:'var(--text1)'}}>localStorage</strong> to store your account data and preferences locally on your device.</p>
        </Section>
        <Section title="What is Stored">
          <p>The following data is stored in localStorage:</p>
          <ul style={{paddingLeft:20,marginTop:8}}>
            <li style={{marginBottom:6}}><code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace',fontSize:13}}>csn5_users</code> — Encrypted account data</li>
            <li style={{marginBottom:6}}><code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace',fontSize:13}}>csn5_session</code> — Your login session (expires in 7 days)</li>
            <li style={{marginBottom:6}}><code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace',fontSize:13}}>csn5_bridge</code> — Server connection settings</li>
            <li style={{marginBottom:6}}><code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace',fontSize:13}}>csn5_stock</code> — Stock market data</li>
          </ul>
        </Section>
        <Section title="How to Clear">
          <p>You can clear all stored data at any time by opening your browser's developer tools and running <code style={{background:'rgba(255,255,255,.06)',padding:'1px 6px',borderRadius:4,fontFamily:'monospace',fontSize:13}}>localStorage.clear()</code> in the console.</p>
        </Section>
      </div>
    </div>
  )
}

export function Impressum() {
  return(
    <div className="gp" style={{maxWidth:800}}>
      <div style={{marginBottom:28}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}><Shield size={22} color="var(--gold)"/><h1 className="tg playfair" style={{fontSize:26,fontWeight:900}}>Impressum</h1></div>
        <p style={{color:'var(--text2)',fontSize:13}}>Legal disclosure · Dev-SMP Casino</p>
      </div>
      <div className="card-flat" style={{padding:32}}>
        <Section title="Operator">
          <p><strong style={{color:'var(--text1)'}}>Dev-SMP Casino</strong><br/>
          Operated by: Schmesmalo<br/>
          Platform: Dev-SMP Minecraft Server<br/>
          Contact: Via Dev-SMP Discord Server</p>
        </Section>
        <Section title="Disclaimer">
          <p>Dev-SMP Casino is a private entertainment platform for members of the Dev-SMP Minecraft server community. It is not a licensed gambling operator. All currency is virtual and has no real monetary value. This service is provided for entertainment purposes only.</p>
        </Section>
        <Section title="Copyright">
          <p>© 2026 Dev-SMP Casino · Schmesmalo · All rights reserved.<br/>
          Unauthorized reproduction or distribution of any content from this platform is prohibited.</p>
        </Section>
        <Section title="Liability">
          <p>The operator assumes no liability for technical failures, data loss, or any other issues arising from use of this platform. Use at your own risk.</p>
        </Section>
      </div>
    </div>
  )
}
