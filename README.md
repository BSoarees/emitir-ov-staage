# Emitir OV no SAP · Staage 1420

Dashboard web pra emissão de Ordens de Venda (VA01) no SAP S/4HANA da Staage (company code 1420) via iFlow CPI.

**URL:** https://bsoarees.github.io/emitir-ov-staage/

## Stack
- HTML/CSS/JS puro + SheetJS (XLSX)
- Supabase (vendas, BPs, materials_mapping)
- n8n workflow `[Staage] F3` → SAP CPI iFlow `salesorderprocess` → S/4HANA

## 4 abas
1. **Pendentes** — lista vendas Staage do mês filtrado, com estado por venda. Seleciona e emite em batch.
2. **Avulso** — 1 OV manual.
3. **Import** — XLSX/CSV com várias OVs.
4. **Materiais** — bate produtos das plataformas (Eduzz/EasyFlow/TMB) com `sap_material_code`. Sem isso, vendas não emitem.

## Webhook
`POST https://n8n.main.mktlab.app/webhook/staage-emitir-ov`
Header `X-API-Key: ...` · Body `{ ovs: [...] }`.

## Aviso PRD
Toda emissão pelo dashboard vai pro SAP **PRD** direto. Cada batch pede confirmação.