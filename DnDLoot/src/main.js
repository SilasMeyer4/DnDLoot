import './style.css';
import { openTab } from './LoadTabs.js';
import * as loaderFunctions from './Loader.js';
import { Program } from './Program.js';

document.querySelector('#app').innerHTML = `
  <div>
    <div class="tab">
        <button class="tablinks" onclick="openTab(event, 'Loader')">Loader</button>
        <button class="tablinks" onclick="openTab(event, 'Program')">Program</button>
    </div>

    
    <div id="Loader" class="tabcontent">
        <div class="input-group">
            <label for="urlText">URL</label>
            <input type="text" id="urlText">
        </div>

        <div class="input-group">
            <label for="filePath">File</label>
            <div id="dropZone">Drag & Drop CSV File</div>
            <input type="text" id="filePath">
        </div>

        <div class="button-group">
            <button id="clearBtn">Clear</button>
            <button id="loadBtn" disabled>Load</button>
    
        </div>
    </div>
      
    <div id="Program" class="tabcontent">
          <!-- Textarea for test -->
    <div class="input-group">
        <label for="testText">Test</label>
        <textarea id="testText" rows="5" cols="50"></textarea>
    </div>

<div class="input-container">
    <div class="input-group">
        <label>Class Loot</label>
        <div class="loot-fields">
            <input type="number" id="classLootAmount" placeholder="Amount">
            <input type="number" id="classLootChance" placeholder="Chance">
            <input list="classLootClasses" id="classLoot" name="classLoot" placeholder="Enter Class">
            <datalist id="classLootClasses">
            </datalist>
            <select id="classLootDropdown">
            </select>
        </div>
    </div>

    <div class="input-group">
        <label>Type Loot</label>
        <div class="loot-fields">
            <input type="number" id="typeLootAmount" placeholder="Amount">
            <input type="number" id="typeLootChange" placeholder="Chance">
            <input list="typeLootTypes" id="typeLoot" name="typeLoot" placeholder="Enter Type">
            <datalist id="typeLootTypes">
            </datalist>
             <select id="typeLootDropdown">
            </select>
        </div>
    </div>
</div>

    <div class="button-group">
        <button id="rollBtn">Roll</button>
    </div>

    <div class="output-group">
        <textarea id="outputText" rows="5" cols="50" readonly></textarea>
    </div>
    </div>
  </div>
`

const program = new Program();

loaderFunctions.initLoader(program);

window.openTab = openTab;
document.querySelector('.tablinks').click();

