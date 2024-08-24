/**
 * @fileoverview Character Sheet Generator Script.
 * @module refactored
 */

/** @type {number} Initial XP available for the character. */
const xpInicial = 1400;

/** @type {Object<number, number>} Cost of each attribute level. */
const precoAtributos = {
  0: 0,
  1: 25,
  2: 25,
  3: 50,
  4: 50,
  5: 100,
  6: 100,
  7: 125,
  8: 125,
  9: 150,
  10: 150,
};

/** @type {Object<number, number>} Cost of each skill level. */
const precoHabilidades = {
  0: 0,
  1: 25,
  2: 25,
  3: 25,
  4: 50,
  5: 50,
  6: 75,
  7: 100,
  8: 100,
  9: 150,
  10: 150,
  11: 175,
  12: 175,
  13: 200,
  14: 200,
  15: 225,
  16: 250,
  17: 250,
  18: 275,
  19: 275,
  20: 300,
};

/**
 * Creates a new skill row element.
 * @param {number} skillCount - The current number of skills to set proper IDs and labels.
 * @returns {?HTMLElement} A div element representing a skill row.
 */
function createSkillRow(skillCount) {
  const skillRow = document.createElement('div');
  skillRow.classList.add('skill-row', 'form-group', 'mb-3');
  skillRow.innerHTML = `
        <label for="skill${skillCount}" class="form-label">Habilidade ${skillCount}:</label>
        <input type="text" class="form-control skill-name mb-3" placeholder="Nome da habilidade">
        <input type="number" class="form-control skill-value mb-3" placeholder="Nível da habilidade" value="0" min="0" max="10">
        <div class="row">
            <div class="col-md-4 d-flex align-items-center">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="passiva${skillCount}" name="passiva${skillCount}" onchange="toggleCheckbox('passiva${skillCount}', 'bonus${skillCount}')">
                    <label class="form-check-label" for="passiva${skillCount}">Passiva</label>
                </div>
            </div>
            <div class="col-md-4 d-flex align-items-center">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="bonus${skillCount}" name="bonus${skillCount}" onchange="toggleCheckbox('bonus${skillCount}', 'passiva${skillCount}')">
                    <label class="form-check-label" for="bonus${skillCount}">Bonus</label>
                </div>
            </div>
        </div>
        <span class="remove-skill text-danger" style="cursor: pointer;">Remover</span>
    `;
  return skillRow;
}

/**
 * Toggles between two checkboxes, ensuring only one is checked at a time.
 * @param {string} selectedId - The ID of the checkbox that was selected.
 * @param {string} otherId - The ID of the other checkbox that should be unchecked.
 */
function toggleCheckbox(selectedId, otherId) {
  const selectedCheckbox = document.getElementById(selectedId);
  const otherCheckbox = document.getElementById(otherId);
  if (selectedCheckbox.checked) {
    otherCheckbox.checked = false;
  }
}

/**
 * Displays an alert message.
 * @param {string} message - The message to display.
 * @param {string} type - The Bootstrap alert type (e.g., 'danger', 'success').
 */
function displayAlert(message, type) {
  const alertContainer = document.getElementById('alert-container');
  alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show mt-5" role="alert">
            <p>Sua ficha tem erros:</p>
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
}

/**
 * Validates the form, checks for errors, and calculates remaining XP.
 * @returns {boolean} Returns true if the form is valid; otherwise, false.
 */
function validateForm() {
  // Clean the old errors 
  document.getElementById('alert-container').innerHTML = '';

  const errors = [];

  validateBasicInfo(errors);
  validateSkills(errors);

  const xpResult = calcularXP(getAtributos(), getHabilidades());
  const xpRestante = xpResult.xpRestante;

  if (xpRestante > 0) {
    errors.push(`- Você tem ${xpRestante} XP sobrando. Gaste os ${xpRestante} restantes.`);
  } else if (xpRestante < 0) {
    errors.push(`- Você gastou ${Math.abs(xpRestante)} XP a mais. Reduza ${Math.abs(xpRestante)} do seu gasto.`);
  }

  if (errors.length > 0) {
    displayAlert(errors.join('<br>'), 'danger');
    return false;
  }

  return true;
}

/**
 * Validates the basic form information (e.g., name, group, age).
 * @param {Array<string>} errors - The array to accumulate error messages.
 */
function validateBasicInfo(errors) {
  const name = document.getElementById('name').value.trim();
  const group = document.getElementById('group').value;
  const classType = document.getElementById('class').value;
  const age = parseInt(document.getElementById('age').value, 10) || 0;
  const occupation = document.getElementById('occupation').value;
  const profession = document.getElementById('profession').value.trim();
  const faceclaim = document.getElementById('faceclaim').value.trim();
  const history = window.editor ? window.editor.getData().trim() : '';

  if (!name) errors.push('- Nome está em branco.');
  if (!group) errors.push('- Você deve selecionar um grupo.');
  if (!classType) errors.push('- Você deve selecionar uma classe.');
  if (!age) errors.push('- Você deve entrar uma idade.');
  validateAgeByGroup(group, age, errors);
  if (!occupation) errors.push('- Você deve selecionar uma ocupação.');
  if (!profession) errors.push('- Você deve entrar uma profissão.');
  if (!faceclaim) errors.push('- Você deve entrar um faceclaim.');
  if (!history) errors.push('- Você deve entrar uma história de personagem.');
}

/**
 * Validates the age based on the selected group.
 * @param {string} group - The selected group.
 * @param {number} age - The age of the character.
 * @param {Array<string>} errors - The array to accumulate error messages.
 */
function validateAgeByGroup(group, age, errors) {
  const ageLimits = {
    Vampiro: 1000,
    Biótico: 1000,
    Parademonio: 1000,
    Licantropo: 300,
    Sereiano: 300,
    Metamorfo: 300,
    Górgona: 200,
    Feiticeiro: 200
  };

  const maxAge = ageLimits[group];
  if (maxAge && age > maxAge) {
    errors.push(`- Sua idade é alta demais para seu grupo. O máximo é ${maxAge} anos.`);
  }
}

/**
 * Validates the skills added to the form.
 * @param {Array<string>} errors - The array to accumulate error messages.
 */
function validateSkills(errors) {
  const habilidades = getHabilidades();
  if (habilidades.length === 0) {
    errors.push('- Você deve adicionar pelo menos uma habilidade.');
  }
}

/**
 * Retrieves the attributes from the form.
 * @returns {Object} The attributes object with values.
 */
function getAtributos() {
  return {
    FOR: parseInt(document.getElementById('for').value, 10) || 0,
    DES: parseInt(document.getElementById('des').value, 10) || 0,
    PRE: parseInt(document.getElementById('pre').value, 10) || 0,
    MEN: parseInt(document.getElementById('men').value, 10) || 0,
    ALM: parseInt(document.getElementById('alm').value, 10) || 0,
    CON: parseInt(document.getElementById('con').value, 10) || 0,
    REF: parseInt(document.getElementById('ref').value, 10) || 0,
    GUA: parseInt(document.getElementById('gua').value, 10) || 0,
    AUR: parseInt(document.getElementById('aur').value, 10) || 0,
    BIO: parseInt(document.getElementById('bio').value, 10) || 0
  };
}

/**
 * Retrieves the skills from the form.
 * @returns {Array<Object>} The list of skills with their values.
 */
function getHabilidades() {
  const skillsContainer = document.getElementById('skills-container');
  const skillRows = skillsContainer.getElementsByClassName('skill-row');
  const habilidades = [];

  Array.from(skillRows).forEach((row, index) => {
    processSkillRow(row, index + 1, habilidades);
  });

  return habilidades;
}

/**
 * Processes a skill row to extract skill details.
 * @param {HTMLElement} row - The row element containing skill data.
 * @param {number} skillCount - The current skill count to ensure unique IDs.
 * @param {Array<Object>} habilidades - The array to store processed skill objects.
 */
function processSkillRow(row, skillCount, habilidades) {
  const skillName = row.querySelector('.skill-name').value.trim();
  const skillValue = parseInt(row.querySelector('.skill-value').value, 10) || 0;
  const skillPassive = row.querySelector(`#passiva${skillCount}`).checked;
  const skillBonus = row.querySelector(`#bonus${skillCount}`).checked;

  if (skillName) {
    habilidades.push({ nome: skillName, valor: skillValue, passiva: skillPassive, bonus: skillBonus });
  }
}

/**
 * Calculates the XP required based on attributes and skills.
 * @param {Object} atributos - The attributes object with values.
 * @param {Array<Object>} habilidades - The list of skills with their values.
 * @returns {Object} The XP calculation result.
 */
function calcularXP(atributos, habilidades) {
  const custoTotalAtributos = calcularCusto(atributos, precoAtributos);
  const custoTotalHabilidades = calcularCustoHabilidades(habilidades);
  const custoTotalXP = custoTotalAtributos + custoTotalHabilidades;
  const xpRestante = xpInicial - custoTotalXP;

  return { atributos, habilidades, custoTotalAtributos, custoTotalHabilidades, custoTotalXP, xpRestante };
}

/**
 * Calculates the cost for attributes or skills.
 * @param {Object|Array<Object>} items - The object or array to calculate the cost for.
 * @param {Object<number, number>} priceList - The price list object to reference.
 * @returns {number} The total cost.
 */
function calcularCusto(items, priceList) {
  return Array.isArray(items)
    ? items.reduce((acc, item) => acc + calcularCustoAtributo(item, priceList), 0)
    : Object.values(items).reduce((acc, val) => acc + calcularCustoAtributo(val, priceList), 0);
}

/**
 * Calculates the cost for a single attribute.
 * @param {number} value - The value to calculate the cost for.
 * @param {Object<number, number>} priceList - The price list object to reference.
 * @returns {number} The cost for the attribute.
 */
function calcularCustoAtributo(value, priceList) {
  let cost = 0;
  for (let i = 1; i <= value; i++) {
    cost += priceList[i] || 0;
  }
  return cost;
}

/**
 * Calculates the cost for skills considering passiva and bonus conditions.
 * @param {Array<Object>} habilidades - The list of skills with their values.
 * @returns {number} The total cost for skills.
 */
function calcularCustoHabilidades(habilidades) {
  return habilidades.reduce((acc, { valor, passiva, bonus }) => {
    if (passiva) return acc + 25;
    if (bonus && valor <= 4) return acc;
    return acc + calcularCustoAtributo(valor, precoHabilidades);
  }, 0);
}

/**
 * Generates the HTML for the character sheet.
 * @param {string} name - The name of the character.
 * @param {string} group - The group of the character.
 * @param {string} classType - The class type of the character.
 * @param {number} age - The age of the character.
 * @param {string} occupation - The occupation of the character.
 * @param {string} profession - The profession of the character.
 * @param {string} faceclaim - The faceclaim of the character.
 * @param {Object} atributos - The attributes object with values.
 * @param {Array<Object>} habilidades - The list of skills with their values.
 * @param {string} characterHistory - The history of the character.
 * @param {string} imageLink - The link to the character's image.
 * @returns {string} The HTML string for the character sheet.
 */
function gerarFicha(name, group, classType, age, occupation, profession, faceclaim, atributos, habilidades, characterHistory, imageLink) {
  const habilidadesHTML = habilidades.map(({ nome, valor, passiva, bonus }) =>
    passiva ? `<b>${nome} —</b> passiva<br>` :
      bonus && valor <= 4 ? `<b>${nome} —</b> 4<br>` :
        `<b>${nome} —</b> ${valor}<br>`
  ).join('');

  return `[dohtml]<style>.one {width: 95%; background-color: #333;}</style>
<div id="holdapp">
    <div class="holdapptop">
        <div class="color"></div>
        <div class="holdinsideapp">
            <div class="tituloapp"><strong>${name}</strong><br><br>
                <div class="jarzietext">
                    <center>
                        <table>
                            <tr>
                                <td>
                                    <div class="appabilities">Grupo</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${group}</div>
                                    </div>
                                    <p>
                                    <div class="appabilities">Classe</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${classType}</div>
                                    </div>
                                    <p>
                                    <div class="appabilities">Idade</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${age} anos</div>
                                    </div>
                                    <p>
                                    <div class="appabilities">Ocupação</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${occupation}</div>
                                    </div>
                                    <p>
                                    <div class="appabilities">Profissão</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${profession}</div>
                                    </div>
                                    <p>
                                    <div class="appabilities">Faceclaim</div>
                                    <div class="appskillscontainer">
                                        <div class="appskills one">${faceclaim}</div>
                                    </div>
                                </td>
                                <td>
                                    <img src="${imageLink || 'https://via.placeholder.com/200x320'}" class="mad_imagem">
                                </td>
                            </tr>
                        </table>
                    </center>
                </div>
                <p><p>
                <div class="tituloapp2"><strong>História</strong></div>
                <div class="jarzietext">${characterHistory}</div>
                <p><p>
                <div class="tituloapp2"><strong>Atributos</strong></div>
                <div class="jarzietext">
                    <center>
                        <table style="padding: 20px 30px;">
                            <tr>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.FOR}</div><p><p> FOR </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.DES}</div><p><p> DES </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.PRE}</div><p><p> PRE </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.MEN}</div><p><p> MEN </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.ALM}</div><p><p> ALM </td>
                            </tr>
                        </table>
                        <table>
                            <tr>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.CON}</div><p><p> CON </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.REF}</div><p><p> REF </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.GUA}</div><p><p> GUA </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.AUR}</div><p><p> AUR </td>
                                <td style="padding: 20px 30px;"><div class="subtituloappi">${atributos.BIO}</div><p><p> BIO </td>
                            </tr>
                        </table>
                    </center>
                </div>
                <p><p>
                <div class="tituloapp2"><strong>Habilidades</strong></div>
                <div class="jarzietext"><b>Habilidade de Grupo</b><br>${habilidadesHTML}</div>
                <p><p>
            </div>
        </div>
    </div>
</div>
[/dohtml]`;
}

/**
 * Transforms the string based on the group.
 * @param {string} grupo - The group string to transform.
 * @returns {string} The transformed string.
 */
function transformarString(grupo) {
  const transformacoes = {
    "Bióticos": "biotico",
    "Caçador": "cacador",
    "Ciborgue": "ciborgue",
    "Feiticeiro": "feiticeiro",
    "Górgonas": "gorgona",
    "Metamorfos": "metamorfo",
    "Licantropos": "licantropo",
    "Sereianos": "sereiano",
    "Vampiros": "vampiro",
    "Demônio": "demonio",
    "Parademônio": "parademonio"
  };

  return transformacoes[grupo] || grupo;
}

/**
 * Generates the photoplayer code.
 * @param {string} nome - The name of the character.
 * @param {string} faceclaim - The faceclaim of the character.
 * @param {string} grupo - The group of the character.
 * @returns {string} The photoplayer code.
 */
function gerarPPCode(nome, faceclaim, grupo) {
  return `[CODE]<b><${transformarString(grupo) || 'grupo'}>${faceclaim.toUpperCase() || 'NOME DO PHOTOPLAYER'}</${transformarString(grupo) || 'grupo'}></b><br> ${nome || 'Nome Personagem'}<br>[/CODE]`;
}
/**
 * Gets the link entered in the image field.
 * @returns {string} The image link
 */
function getImageLink() {
  const imageLink = document.getElementById('imageLink').value;
  document.getElementById('imageFrame').src = imageLink;
  return imageLink;
}

/**
 * Generates the occupation code.
 * @param {string} nome - The name of the character.
 * @param {string} grupo - The group of the character.
 * @param {string} ocupacao - The occupation of the character.
 * @returns {string} The occupation code.
 */
function gerarOCCode(nome, grupo, ocupacao) {
  return `${nome || 'Nome do Personagem'}: ${grupo || 'Grupo'}, ${ocupacao || 'Ocupação'}.`;
}

/**
 * Event listeners initialization.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Select2 for dropdowns
  $('#group, #class, #occupation').select2({
    placeholder: "Selecione uma opção",
    allowClear: true
  });

  // Add skill row
  document.getElementById('add-skill').addEventListener('click', () => {
    const skillsContainer = document.getElementById('skills-container');
    const skillCount = skillsContainer.getElementsByClassName('skill-row').length + 1;
    const skillRow = createSkillRow(skillCount);
    skillsContainer.appendChild(skillRow);

    skillRow.querySelector('.remove-skill').addEventListener('click', () => {
      skillsContainer.removeChild(skillRow);
    });
  });

  // Get the image
  document.getElementById('sendImg').addEventListener('click', () => getImageLink());

  // Generate character sheet
  document.getElementById('generate').addEventListener('click', () => {
    document.getElementById("generated-code").classList.remove("border-danger");

    if (!validateForm()) {
      document.getElementById("generated-code").classList.add("border-danger");
    }

    const name = document.getElementById('name').value;
    const group = document.getElementById('group').value;
    const classType = document.getElementById('class').value;
    const age = parseInt(document.getElementById('age').value, 10) || 0;
    const occupation = document.getElementById('occupation').value;
    const profession = document.getElementById('profession').value;
    const faceclaim = document.getElementById('faceclaim').value;
    const atributos = getAtributos();
    const habilidades = getHabilidades();
    const characterHistory = window.editor.getData();
    const imageLink = getImageLink();

    const characterSheetHTML = gerarFicha(name, group, classType, age, occupation, profession, faceclaim, atributos, habilidades, characterHistory, imageLink);
    document.getElementById('generated-code').textContent = characterSheetHTML;

    const photoplayerCode = gerarPPCode(name, faceclaim, group);
    document.getElementById('photoplayerRegistry').placeholder = photoplayerCode;

    const occupationCode = gerarOCCode(name, group, occupation);
    document.getElementById('occupationRegistry').placeholder = occupationCode;

    const xpResult = JSON.stringify(calcularXP(atributos, habilidades), null, 2);
    document.getElementById('xp-json').textContent = xpResult;
  });

  // Copy to clipboard functions
  ['copy-generated', 'copy-xp', 'copy-pp', 'copy-oc'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      const target = id.replace('copy-', '');
      const element = document.getElementById(target);

      navigator.clipboard.writeText(element.textContent || element.placeholder).then(() => {
        alert('Copiado para a área de transferência!');
      });
    });
  });

  // Get the image
  document.getElementById('export').addEventListener('click', () => exportToJSON());
});

// Função para exportar dados do formulário como JSON
function exportToJSON() {
  const formData = {
    name: document.getElementById('name').value,
    group: document.getElementById('group').value,
    class: document.getElementById('class').value,
    age: document.getElementById('age').value,
    occupation: document.getElementById('occupation').value,
    profession: document.getElementById('profession').value,
    faceclaim: document.getElementById('faceclaim').value,
    imageLink: document.getElementById('imageLink').value,
    history: window.editor ? window.editor.getData() : document.getElementById('history').value,
    attributes: {
      for: document.getElementById('for').value,
      des: document.getElementById('des').value,
      pre: document.getElementById('pre').value,
      men: document.getElementById('men').value,
      alm: document.getElementById('alm').value,
      con: document.getElementById('con').value,
      ref: document.getElementById('ref').value,
      gua: document.getElementById('gua').value,
      aur: document.getElementById('aur').value,
      bio: document.getElementById('bio').value
    },
    skills: Array.from(document.querySelectorAll('.skill-row')).map((row, index) => {
      // Use the index to find the correct checkboxes
      const passivaCheckbox = document.querySelector(`#passiva${index + 1}`);
      const bonusCheckbox = document.querySelector(`#bonus${index + 1}`);

      return {
        name: row.querySelector('.skill-name').value,
        value: row.querySelector('.skill-value').value,
        passiva: passivaCheckbox ? passivaCheckbox.checked : false,
        bonus: bonusCheckbox ? bonusCheckbox.checked : false
      };
    })
  };

  const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'character-sheet.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Função para importar dados do arquivo JSON e preencher o formulário
function importFromJSON(file) {
  console.log("Importando dados...");
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const formData = JSON.parse(e.target.result);

      // Preencher os campos do formulário
      document.querySelector('#name').value = formData.name || '';
      // document.querySelector('#group').value = formData.group || '';
      $('#group').val(formData.group || '').trigger('change');
      // document.querySelector('#class').value = formData.class || '';
      $('#class').val(formData.class || '').trigger('change');
      document.querySelector('#age').value = formData.age || '';
      // document.querySelector('#occupation').value = formData.occupation || '';
      $('#occupation').val(formData.occupation || '').trigger('change');
      document.querySelector('#profession').value = formData.profession || '';
      document.querySelector('#faceclaim').value = formData.faceclaim || '';
      document.querySelector('#imageLink').value = formData.imageLink || '';
      document.getElementById('imageFrame').src = JSON.parse(e.target.result).imageLink || 'https://via.placeholder.com/200x320';

      if (window.editor) {
        window.editor.setData(formData.history || '');
      } else {
        document.querySelector('#history').value = formData.history || '';
      }

      // Preencher os atributos
      const attributes = formData.attributes || {};
      document.querySelector('#for').value = attributes.for || '1';
      document.querySelector('#des').value = attributes.des || '1';
      document.querySelector('#pre').value = attributes.pre || '1';
      document.querySelector('#men').value = attributes.men || '1';
      document.querySelector('#alm').value = attributes.alm || '1';
      document.querySelector('#con').value = attributes.con || '1';
      document.querySelector('#ref').value = attributes.ref || '1';
      document.querySelector('#gua').value = attributes.gua || '1';
      document.querySelector('#aur').value = attributes.aur || '1';
      document.querySelector('#bio').value = attributes.bio || '1';

      // Preencher as habilidades
      const skillsContainer = document.querySelector('#skills-container');
      skillsContainer.innerHTML = ''; // Limpar habilidades existentes

      if (Array.isArray(formData.skills)) {
        formData.skills.forEach((skill, index) => {
          const skillRow = document.createElement('div');
          skillRow.className = 'skill-row form-group mb-3';
          skillRow.innerHTML = `
                <label for="skill${index + 1}" class="form-label">Habilidade ${index + 1}:</label>
                <input type="text" class="form-control skill-name mb-3" placeholder="Nome da habilidade" value="${skill.name || ''}">
                <input type="number" class="form-control skill-value mb-3" placeholder="Nível da habilidade" value="${skill.value || 0}" min="0" max="10">
                <div class="row">
                    <div class="col-md-4 d-flex align-items-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="passiva${index + 1}" name="passiva${index + 1}" ${skill.passiva ? 'checked' : ''}>
                            <label class="form-check-label" for="passiva${index + 1}">Passiva</label>
                        </div>
                    </div>
                    <div class="col-md-4 d-flex align-items-center">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="bonus${index + 1}" name="bonus${index + 1}" ${skill.bonus ? 'checked' : ''}>
                            <label class="form-check-label" for="bonus${index + 1}">Bonus</label>
                        </div>
                    </div>
                </div>
                <span class="remove-skill text-danger" style="cursor: pointer;">Remover</span>
            `;
          skillsContainer.appendChild(skillRow);
        });
      }
    } catch (error) {
      console.error('Erro ao ler o arquivo JSON:', error);
      alert('Erro ao processar o arquivo JSON.');
    }
  };
  reader.readAsText(file);
  alert("Importado com sucesso");
}

// Adicionar o event listener para o botão de importação
document.querySelector('#import').addEventListener('click', function () {
  console.log("Click")
  const fileInput = document.querySelector('#importFile');
  if (fileInput.files.length > 0) {
    importFromJSON(fileInput.files[0]);
  } else {
    alert('Nenhum arquivo selecionado para importar.');
  }
});

